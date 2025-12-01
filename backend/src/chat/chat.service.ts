import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Message } from '../entities/message.entity';
import { Match } from '../entities/match.entity';
import { MatchesService } from '../matches/matches.service';
import { SendMessageDto } from './dto/send-message.dto';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message)
    private messagesRepository: Repository<Message>,
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    private matchesService: MatchesService,
  ) {}

  /**
   * Get messages for a match
   */
  async getMessages(
    matchId: string,
    userId: string,
    limit: number = 50,
    offset: number = 0,
    markAsRead: boolean = true,
  ): Promise<{ messages: Message[]; total: number; unreadCount: number }> {
    // Verify match exists and user is part of it
    await this.matchesService.getMatch(matchId, userId);

    const [messages, total] = await this.messagesRepository.findAndCount({
      where: { matchId },
      relations: ['sender', 'sender.profile'],
      order: { sentAt: 'DESC' },
      take: limit,
      skip: offset,
    });

    // Get unread count before marking as read
    const unreadCount = await this.getUnreadCountForMatch(matchId, userId);

    // Mark messages as read only if requested
    if (markAsRead) {
      await this.markMessagesAsRead(matchId, userId);
    }

    return { messages: messages.reverse(), total, unreadCount };
  }

  /**
   * Send a message
   */
  async sendMessage(
    matchId: string,
    senderId: string,
    sendMessageDto: SendMessageDto,
  ): Promise<Message> {
    // Verify match exists and user is part of it
    const match = await this.matchesService.getMatch(matchId, senderId);

    if (!match.isActive) {
      throw new ForbiddenException('Cannot send messages to an inactive match');
    }

    // Create and save message
    const message = this.messagesRepository.create({
      matchId,
      senderId,
      content: sendMessageDto.content,
    });

    await this.messagesRepository.save(message);

    // Load message with sender info
    const savedMessage = await this.messagesRepository.findOne({
      where: { id: message.id },
      relations: ['sender', 'sender.profile'],
    });

    return savedMessage!;
  }

  /**
   * Mark messages as read
   */
  async markMessagesAsRead(matchId: string, userId: string): Promise<void> {
    await this.messagesRepository
      .createQueryBuilder()
      .update(Message)
      .set({ isRead: true })
      .where('matchId = :matchId', { matchId })
      .andWhere('senderId != :userId', { userId })
      .andWhere('isRead = false')
      .execute();
  }

  /**
   * Get unread message count for a user
   */
  async getUnreadCount(userId: string): Promise<number> {
    // Get all matches for the user
    const matches = await this.matchesRepository.find({
      where: [
        { user1Id: userId, isActive: true },
        { user2Id: userId, isActive: true },
      ],
      select: ['id'],
    });

    if (matches.length === 0) return 0;

    const matchIds = matches.map((m) => m.id);

    // Count unread messages not from this user
    const count = await this.messagesRepository
      .createQueryBuilder('message')
      .where('message.matchId IN (:...matchIds)', { matchIds })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.isRead = false')
      .getCount();

    return count;
  }

  /**
   * Get last message for a match
   */
  async getLastMessage(matchId: string): Promise<Message | null> {
    return this.messagesRepository.findOne({
      where: { matchId },
      order: { sentAt: 'DESC' },
      relations: ['sender', 'sender.profile'],
    });
  }

  /**
   * Get unread count for a specific match
   */
  async getUnreadCountForMatch(matchId: string, userId: string): Promise<number> {
    return this.messagesRepository
      .createQueryBuilder('message')
      .where('message.matchId = :matchId', { matchId })
      .andWhere('message.senderId != :userId', { userId })
      .andWhere('message.isRead = false')
      .getCount();
  }

  /**
   * Get last message with unread count for a match
   */
  async getLastMessageWithUnread(
    matchId: string,
    userId: string,
  ): Promise<{ lastMessage: Message | null; unreadCount: number }> {
    const [lastMessage, unreadCount] = await Promise.all([
      this.getLastMessage(matchId),
      this.getUnreadCountForMatch(matchId, userId),
    ]);
    return { lastMessage, unreadCount };
  }
}


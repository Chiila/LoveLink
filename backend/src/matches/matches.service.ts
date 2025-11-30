import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Match } from '../entities/match.entity';
import { User } from '../entities/user.entity';

export interface MatchWithPartner extends Match {
  partner: User;
}

@Injectable()
export class MatchesService {
  constructor(
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  /**
   * Get all active matches for a user
   */
  async getUserMatches(userId: string): Promise<MatchWithPartner[]> {
    const matches = await this.matchesRepository.find({
      where: [
        { user1Id: userId, isActive: true },
        { user2Id: userId, isActive: true },
      ],
      relations: ['user1', 'user1.profile', 'user2', 'user2.profile', 'messages'],
      order: { matchedAt: 'DESC' },
    });

    // Transform matches to include partner info
    return matches.map((match) => {
      const partner = match.user1Id === userId ? match.user2 : match.user1;
      return {
        ...match,
        partner,
      };
    });
  }

  /**
   * Get a specific match
   */
  async getMatch(matchId: string, userId: string): Promise<MatchWithPartner> {
    const match = await this.matchesRepository.findOne({
      where: { id: matchId, isActive: true },
      relations: ['user1', 'user1.profile', 'user2', 'user2.profile'],
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Verify user is part of this match
    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new ForbiddenException('You are not part of this match');
    }

    const partner = match.user1Id === userId ? match.user2 : match.user1;
    return {
      ...match,
      partner,
    };
  }

  /**
   * Unmatch (remove match)
   */
  async unmatch(matchId: string, userId: string): Promise<void> {
    const match = await this.matchesRepository.findOne({
      where: { id: matchId },
    });

    if (!match) {
      throw new NotFoundException('Match not found');
    }

    // Verify user is part of this match
    if (match.user1Id !== userId && match.user2Id !== userId) {
      throw new ForbiddenException('You are not part of this match');
    }

    // Soft delete - mark as inactive
    match.isActive = false;
    match.unmatchedAt = new Date();
    await this.matchesRepository.save(match);
  }

  /**
   * Check if two users are matched
   */
  async areMatched(user1Id: string, user2Id: string): Promise<boolean> {
    const match = await this.matchesRepository.findOne({
      where: [
        { user1Id, user2Id, isActive: true },
        { user1Id: user2Id, user2Id: user1Id, isActive: true },
      ],
    });

    return !!match;
  }

  /**
   * Get match count for a user
   */
  async getMatchCount(userId: string): Promise<number> {
    return this.matchesRepository.count({
      where: [
        { user1Id: userId, isActive: true },
        { user2Id: userId, isActive: true },
      ],
    });
  }
}


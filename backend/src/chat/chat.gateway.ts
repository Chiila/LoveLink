import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { MatchesService } from '../matches/matches.service';

interface AuthenticatedSocket extends Socket {
  userId?: string;
}

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    private jwtService: JwtService,
    private chatService: ChatService,
    private matchesService: MatchesService,
  ) {}

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from query or headers
      const token =
        client.handshake.query.token as string ||
        client.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token);
      client.userId = payload.sub;
      this.connectedUsers.set(client.id, payload.sub);

      // Join user's personal room for notifications
      client.join(`user:${payload.sub}`);

      console.log(`User ${payload.sub} connected via WebSocket`);
    } catch (error) {
      console.error('WebSocket authentication failed:', error);
      client.disconnect();
    }
  }

  /**
   * Handle WebSocket disconnection
   */
  handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      console.log(`User ${client.userId} disconnected`);
    }
    this.connectedUsers.delete(client.id);
  }

  /**
   * Join a chat room (match)
   */
  @SubscribeMessage('joinChat')
  async handleJoinChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string },
  ) {
    if (!client.userId) return;

    try {
      // Verify user is part of this match
      await this.matchesService.getMatch(data.matchId, client.userId);
      
      // Join the chat room
      client.join(`match:${data.matchId}`);
      
      return { success: true, message: 'Joined chat room' };
    } catch (error) {
      return { success: false, message: 'Failed to join chat' };
    }
  }

  /**
   * Leave a chat room
   */
  @SubscribeMessage('leaveChat')
  async handleLeaveChat(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string },
  ) {
    client.leave(`match:${data.matchId}`);
    return { success: true };
  }

  /**
   * Send a message via WebSocket
   */
  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string; content: string },
  ) {
    if (!client.userId) return;

    try {
      // Save message to database
      const message = await this.chatService.sendMessage(
        data.matchId,
        client.userId,
        { content: data.content },
      );

      // Broadcast to all users in the chat room
      this.server.to(`match:${data.matchId}`).emit('newMessage', {
        message,
        matchId: data.matchId,
      });

      // Get match to find the recipient
      const match = await this.matchesService.getMatch(data.matchId, client.userId);
      const recipientId = match.partner.id;

      // Send notification to recipient if not in the chat room
      this.server.to(`user:${recipientId}`).emit('messageNotification', {
        matchId: data.matchId,
        senderId: client.userId,
        preview: data.content.substring(0, 50),
      });

      return { success: true, message };
    } catch (error) {
      return { success: false, message: 'Failed to send message' };
    }
  }

  /**
   * Mark messages as read
   */
  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string },
  ) {
    if (!client.userId) return;

    try {
      await this.chatService.markMessagesAsRead(data.matchId, client.userId);
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  }

  /**
   * Typing indicator
   */
  @SubscribeMessage('typing')
  async handleTyping(
    @ConnectedSocket() client: AuthenticatedSocket,
    @MessageBody() data: { matchId: string; isTyping: boolean },
  ) {
    if (!client.userId) return;

    // Broadcast typing status to other users in the chat room
    client.to(`match:${data.matchId}`).emit('userTyping', {
      userId: client.userId,
      matchId: data.matchId,
      isTyping: data.isTyping,
    });
  }

  /**
   * Emit new match notification
   */
  emitNewMatch(userId: string, match: any) {
    this.server.to(`user:${userId}`).emit('newMatch', { match });
  }
}


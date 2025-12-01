import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /**
   * Get messages for a match
   * GET /chat/:matchId
   */
  @Get(':matchId')
  async getMessages(
    @Request() req: any,
    @Param('matchId') matchId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('markAsRead') markAsRead?: string,
  ) {
    const result = await this.chatService.getMessages(
      matchId,
      req.user.id,
      limit ? parseInt(limit) : 50,
      offset ? parseInt(offset) : 0,
      markAsRead !== 'false', // Default to true, only false if explicitly set
    );

    return {
      success: true,
      data: {
        messages: result.messages,
        total: result.total,
        unreadCount: result.unreadCount,
      },
    };
  }

  /**
   * Send a message
   * POST /chat/:matchId
   */
  @Post(':matchId')
  async sendMessage(
    @Request() req: any,
    @Param('matchId') matchId: string,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const message = await this.chatService.sendMessage(
      matchId,
      req.user.id,
      sendMessageDto,
    );

    return {
      success: true,
      message: 'Message sent',
      data: { message },
    };
  }

  /**
   * Get unread message count
   * GET /chat/unread/count
   */
  @Get('unread/count')
  async getUnreadCount(@Request() req: any) {
    const count = await this.chatService.getUnreadCount(req.user.id);

    return {
      success: true,
      data: { unreadCount: count },
    };
  }
}


import {
  Controller,
  Get,
  Delete,
  Param,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { MatchesService } from './matches.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
  constructor(private readonly matchesService: MatchesService) {}

  /**
   * Get all matches for current user
   * GET /matches
   */
  @Get()
  async getMatches(@Request() req: any) {
    const matches = await this.matchesService.getUserMatches(req.user.id);

    return {
      success: true,
      data: {
        matches,
        count: matches.length,
      },
    };
  }

  /**
   * Get a specific match
   * GET /matches/:id
   */
  @Get(':id')
  async getMatch(@Request() req: any, @Param('id') matchId: string) {
    const match = await this.matchesService.getMatch(matchId, req.user.id);

    return {
      success: true,
      data: { match },
    };
  }

  /**
   * Unmatch a user
   * DELETE /matches/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async unmatch(@Request() req: any, @Param('id') matchId: string) {
    await this.matchesService.unmatch(matchId, req.user.id);

    return {
      success: true,
      message: 'Successfully unmatched',
    };
  }
}


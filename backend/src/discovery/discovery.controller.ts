import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { DiscoveryService } from './discovery.service';
import { SwipeDto } from './dto/swipe.dto';
import { DiscoveryFiltersDto } from './dto/discovery-filters.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('discovery')
@UseGuards(JwtAuthGuard)
export class DiscoveryController {
  constructor(private readonly discoveryService: DiscoveryService) {}

  /**
   * Get profiles to discover
   * GET /discovery
   */
  @Get()
  async getProfiles(@Request() req: any, @Query() filters: DiscoveryFiltersDto) {
    const profiles = await this.discoveryService.getProfilesToDiscover(
      req.user.id,
      filters,
    );

    return {
      success: true,
      data: {
        profiles,
        count: profiles.length,
      },
    };
  }

  /**
   * Swipe on a profile
   * POST /discovery/swipe
   */
  @Post('swipe')
  async swipe(@Request() req: any, @Body() swipeDto: SwipeDto) {
    const result = await this.discoveryService.swipe(req.user.id, swipeDto);

    return {
      success: true,
      message: result.message,
      data: {
        isMatch: !!result.match,
        match: result.match,
      },
    };
  }

  /**
   * Get swipe statistics
   * GET /discovery/stats
   */
  @Get('stats')
  async getStats(@Request() req: any) {
    const stats = await this.discoveryService.getSwipeStats(req.user.id);

    return {
      success: true,
      data: { stats },
    };
  }
}


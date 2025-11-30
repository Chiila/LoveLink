import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Not, In } from 'typeorm';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { Swipe, SwipeDirection } from '../entities/swipe.entity';
import { Match } from '../entities/match.entity';
import { SwipeDto } from './dto/swipe.dto';
import { DiscoveryFiltersDto } from './dto/discovery-filters.dto';

@Injectable()
export class DiscoveryService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Profile)
    private profilesRepository: Repository<Profile>,
    @InjectRepository(Swipe)
    private swipesRepository: Repository<Swipe>,
    @InjectRepository(Match)
    private matchesRepository: Repository<Match>,
  ) {}

  /**
   * Get profiles to discover (excluding already swiped profiles)
   */
  async getProfilesToDiscover(
    userId: string,
    filters: DiscoveryFiltersDto,
  ): Promise<Profile[]> {
    // Get IDs of users already swiped
    const swipedUsers = await this.swipesRepository.find({
      where: { swiperId: userId },
      select: ['swipedId'],
    });
    const swipedIds = swipedUsers.map((s) => s.swipedId);

    // Get current user's profile for preferences
    const currentProfile = await this.profilesRepository.findOne({
      where: { userId },
    });

    if (!currentProfile) {
      throw new NotFoundException('Profile not found');
    }

    // Build query
    let query = this.profilesRepository
      .createQueryBuilder('profile')
      .where('profile.userId != :userId', { userId });

    // Exclude already swiped users
    if (swipedIds.length > 0) {
      query = query.andWhere('profile.userId NOT IN (:...swipedIds)', { swipedIds });
    }

    // Apply age filters
    const minAge = filters.minAge || currentProfile.minAgePreference || 18;
    const maxAge = filters.maxAge || currentProfile.maxAgePreference || 100;
    query = query.andWhere('profile.age >= :minAge', { minAge });
    query = query.andWhere('profile.age <= :maxAge', { maxAge });

    // Apply gender filter based on preferences
    if (currentProfile.interestedIn) {
      query = query.andWhere('profile.gender = :gender', {
        gender: currentProfile.interestedIn,
      });
    }

    // Apply distance filter if location is available
    if (
      filters.maxDistance &&
      currentProfile.latitude &&
      currentProfile.longitude
    ) {
      // Using Haversine formula for distance calculation
      query = query.andWhere(
        `(
          6371 * acos(
            cos(radians(:lat)) * cos(radians(profile.latitude)) *
            cos(radians(profile.longitude) - radians(:lng)) +
            sin(radians(:lat)) * sin(radians(profile.latitude))
          )
        ) <= :maxDistance`,
        {
          lat: currentProfile.latitude,
          lng: currentProfile.longitude,
          maxDistance: filters.maxDistance,
        },
      );
    }

    // Order by most recent activity and limit results
    query = query
      .orderBy('profile.updatedAt', 'DESC')
      .take(filters.limit || 20);

    return query.getMany();
  }

  /**
   * Process a swipe (like or skip)
   */
  async swipe(
    userId: string,
    swipeDto: SwipeDto,
  ): Promise<{ match: Match | null; message: string }> {
    const { targetUserId, direction } = swipeDto;

    // Prevent self-swiping
    if (userId === targetUserId) {
      throw new BadRequestException('Cannot swipe on yourself');
    }

    // Check if target user exists
    const targetUser = await this.usersRepository.findOne({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      throw new NotFoundException('User not found');
    }

    // Check if already swiped
    const existingSwipe = await this.swipesRepository.findOne({
      where: { swiperId: userId, swipedId: targetUserId },
    });

    if (existingSwipe) {
      throw new BadRequestException('Already swiped on this profile');
    }

    // Create swipe record
    const swipe = this.swipesRepository.create({
      swiperId: userId,
      swipedId: targetUserId,
      direction,
    });

    await this.swipesRepository.save(swipe);

    // If liked, check for mutual like (match)
    if (direction === SwipeDirection.RIGHT) {
      const mutualLike = await this.swipesRepository.findOne({
        where: {
          swiperId: targetUserId,
          swipedId: userId,
          direction: SwipeDirection.RIGHT,
        },
      });

      if (mutualLike) {
        // Create a match!
        const match = this.matchesRepository.create({
          user1Id: userId,
          user2Id: targetUserId,
        });

        await this.matchesRepository.save(match);

        // Load match with user profiles
        const matchWithUsers = await this.matchesRepository.findOne({
          where: { id: match.id },
          relations: ['user1', 'user1.profile', 'user2', 'user2.profile'],
        });

        return {
          match: matchWithUsers,
          message: "It's a match! 🎉",
        };
      }

      return {
        match: null,
        message: 'Liked! Waiting for them to like you back.',
      };
    }

    return {
      match: null,
      message: 'Skipped',
    };
  }

  /**
   * Get swipe stats for current user
   */
  async getSwipeStats(userId: string): Promise<{
    totalSwipes: number;
    likes: number;
    skips: number;
    receivedLikes: number;
  }> {
    const swipes = await this.swipesRepository.find({
      where: { swiperId: userId },
    });

    const receivedLikes = await this.swipesRepository.count({
      where: { swipedId: userId, direction: SwipeDirection.RIGHT },
    });

    const likes = swipes.filter((s) => s.direction === SwipeDirection.RIGHT).length;
    const skips = swipes.filter((s) => s.direction === SwipeDirection.LEFT).length;

    return {
      totalSwipes: swipes.length,
      likes,
      skips,
      receivedLikes,
    };
  }
}


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DiscoveryService } from './discovery.service';
import { DiscoveryController } from './discovery.controller';
import { User } from '../entities/user.entity';
import { Profile } from '../entities/profile.entity';
import { Swipe } from '../entities/swipe.entity';
import { Match } from '../entities/match.entity';
import { AuthModule } from '../auth/auth.module';
import { MatchesModule } from '../matches/matches.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Profile, Swipe, Match]),
    AuthModule,
  ],
  controllers: [DiscoveryController],
  providers: [DiscoveryService],
  exports: [DiscoveryService],
})
export class DiscoveryModule {}


import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { DiscoveryModule } from './discovery/discovery.module';
import { MatchesModule } from './matches/matches.module';
import { ChatModule } from './chat/chat.module';
import { User } from './entities/user.entity';
import { Profile } from './entities/profile.entity';
import { Swipe } from './entities/swipe.entity';
import { Match } from './entities/match.entity';
import { Message } from './entities/message.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '3306'),
      username: process.env.DATABASE_USER || 'root',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'lovelink',
      entities: [User, Profile, Swipe, Match, Message],
      synchronize: true, // Set to false in production
      logging: false,
      retryAttempts: 3,
      retryDelay: 3000,
    }),
    AuthModule,
    UsersModule,
    DiscoveryModule,
    MatchesModule,
    ChatModule,
  ],
})
export class AppModule {}


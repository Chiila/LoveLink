import { IsString, IsEnum, IsUUID } from 'class-validator';
import { SwipeDirection } from '../../entities/swipe.entity';

export class SwipeDto {
  @IsUUID()
  targetUserId: string;

  @IsEnum(SwipeDirection, { message: 'Direction must be either "left" or "right"' })
  direction: SwipeDirection;
}


import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Unique,
} from 'typeorm';
import { User } from './user.entity';

export enum SwipeDirection {
  LEFT = 'left',
  RIGHT = 'right',
}

@Entity('swipes')
@Unique(['swiperId', 'swipedId'])
export class Swipe {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  swiperId: string;

  @Column()
  swipedId: string;

  @Column({
    type: 'enum',
    enum: SwipeDirection,
  })
  direction: SwipeDirection;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, (user) => user.swipes)
  @JoinColumn({ name: 'swiperId' })
  swiper: User;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'swipedId' })
  swiped: User;
}


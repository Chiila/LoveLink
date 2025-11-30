import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  OneToMany,
} from 'typeorm';
import { Profile } from './profile.entity';
import { Swipe } from './swipe.entity';
import { Match } from './match.entity';
import { Message } from './message.entity';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude()
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  lastActive: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true })
  profile: Profile;

  @OneToMany(() => Swipe, (swipe) => swipe.swiper)
  swipes: Swipe[];

  @OneToMany(() => Match, (match) => match.user1)
  matchesAsUser1: Match[];

  @OneToMany(() => Match, (match) => match.user2)
  matchesAsUser2: Match[];

  @OneToMany(() => Message, (message) => message.sender)
  sentMessages: Message[];
}


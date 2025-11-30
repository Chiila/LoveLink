import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { User } from './user.entity';
import { Message } from './message.entity';

@Entity('matches')
export class Match {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user1Id: string;

  @Column()
  user2Id: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  matchedAt: Date;

  @Column({ nullable: true })
  unmatchedAt: Date;

  @ManyToOne(() => User, (user) => user.matchesAsUser1)
  @JoinColumn({ name: 'user1Id' })
  user1: User;

  @ManyToOne(() => User, (user) => user.matchesAsUser2)
  @JoinColumn({ name: 'user2Id' })
  user2: User;

  @OneToMany(() => Message, (message) => message.match)
  messages: Message[];
}


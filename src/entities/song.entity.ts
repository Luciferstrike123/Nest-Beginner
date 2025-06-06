import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Author } from './author.entity';
import { Comment } from './comment.entity';
import { Like } from './like.entity';
import {Question} from './question.entity';
import { User } from './user.entity';

@Entity()
export class Song {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column({ nullable: true })
  fileUrl: string;

  @Column({ nullable: true })
  imageUrl: string;

  @Column({ nullable: true, default: 0 })
  duration: number;

  @Column({ default: 0 })
  playCount: number;

  @ManyToOne(() => User, (user) => user.music)
  author: User;

  @OneToMany(() => Comment, (comment) => comment.song)
  comments: Comment[];

  @OneToMany(() => Like, (like) => like.song)
  likes: Like[];

  @OneToMany(() => Question, (question) => question.song, {cascade: true})
  questions: Question[];
}

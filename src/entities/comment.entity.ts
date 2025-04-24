import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Song } from './song.entity';
import { User } from './user.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: string;

  @Column()
  content: string;

  @ManyToOne(() => User, (user) => user.comment)
  user: User;

  @ManyToOne(() => Song, (song) => song.comment)
  music: Song;
}
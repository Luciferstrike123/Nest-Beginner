import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Song } from './song.entity';

@Entity()
export class Author {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  bio: string;

  @OneToMany(() => Song, (song) => song.author)
  music: Song[]; // List of songs by this author
}

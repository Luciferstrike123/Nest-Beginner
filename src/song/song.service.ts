import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Song } from 'src/entities/song.entity';
import { Repository } from 'typeorm';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';
import { User } from 'src/entities/user.entity';
import { SongDTO } from './dto/song.dto';

@Injectable()
export class SongService {
  constructor(
    @InjectRepository(Song) private songRepo: Repository<Song>,
    @InjectRepository(User) private userRepo: Repository<User>,
) {}

  async create(userId: string ,songDto: CreateSongDto): Promise<Song> {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      throw new Error(`User with id ${userId} not found`);
    }
    const song = new Song();
    song.title = songDto.title;
    song.fileUrl = songDto.fileUrl;
    song.author = user;
    return this.songRepo.save(song);
  }

  async findAll(): Promise<SongDTO[]> {
    const songs = await this.songRepo.find({
      relations: ['author', 'comments', 'likes'],
    });

    const result: SongDTO[] = songs.map((song) => ({
      id: song.id,
      title: song.title,
      fileUrl: song.fileUrl,
      duration: song.duration,
      playCount: song.playCount,
      authorName: song.author.username,
      authorId: song.author.id,
      comments: song.comments || [],
      likes: song.likes || [],
    }));

    return result;
  }

  async findOne(id: string): Promise<SongDTO> {
    const song = await this.songRepo.findOne({
      where: { id },
      relations: ['author', 'comments', 'likes'],
    });
    if (!song) {
      throw new Error(`Song with id ${id} not found`);
    }
    const songDto: SongDTO = {
      id: song.id,
      title: song.title,
      fileUrl: song.fileUrl,
      duration: song.duration,
      playCount: song.playCount,
      authorName: song.author.username,
      authorId: song.author.id,
      comments: song.comments || [],
      likes: song.likes || [],
    };
    return songDto;
  }

  update(userId: string ,id: string, updateDto: UpdateSongDto) {
    const song = this.songRepo.findOne({ where: { id, author:{id: userId} } });
    if (!song) {
      throw new Error(`Song with id ${id} not found or not owned by user ${userId}`);
    }
    return this.songRepo.update(id, updateDto);
  }

  remove(userId: string ,id: string) {
    const song = this.songRepo.findOne({ where: { id, author:{id: userId} } });
    if (!song) {
      throw new Error(`Song with id ${id} not found or not owned by user ${userId}`);
    }
    return this.songRepo.delete(id);
  }
}

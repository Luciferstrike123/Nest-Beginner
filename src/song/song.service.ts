import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Song } from 'src/entities/song.entity';
import { Repository } from 'typeorm';
import { CreateSongDto } from './dto/create-song.dto';
import { UpdateSongDto } from './dto/update-song.dto';

@Injectable()
export class SongService {
  constructor(@InjectRepository(Song) private songRepo: Repository<Song>) {}

  create(songDto: CreateSongDto): Promise<Song> {
    const song = this.songRepo.create(songDto);
    return this.songRepo.save(song);
  }

  findAll(): Promise<Song[]> {
    return this.songRepo.find({ relations: ['author', 'comments', 'likes'] });
  }

  async findOne(id: string): Promise<Song> {
    const song = await this.songRepo.findOne({
      where: { id },
      relations: ['author', 'comments', 'likes'],
    });
    if (!song) {
      throw new Error(`Song with id ${id} not found`);
    }
    return song;
  }

  update(id: string, updateDto: UpdateSongDto) {
    return this.songRepo.update(id, updateDto);
  }

  remove(id: string) {
    return this.songRepo.delete(id);
  }
}

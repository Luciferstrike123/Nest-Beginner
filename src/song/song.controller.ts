import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { SongService } from './song.service';
import { UpdateSongDto } from './dto/update-song.dto';
import { CreateSongDto } from './dto/create-song.dto';

@ApiTags('songs')
@Controller('songs')
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Post()
  @ApiOperation({ summary: 'Create song' })
  create(@Body() createSongDto: CreateSongDto) {
    return this.songService.create(createSongDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all songs' })
  findAll() {
    return this.songService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get one song' })
  findOne(@Param('id') id: string) {
    return this.songService.findOne(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update song' })
  update(@Param('id') id: string, @Body() updateDto: UpdateSongDto) {
    return this.songService.update(id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete song' })
  remove(@Param('id') id: string) {
    return this.songService.remove(id);
  }
}

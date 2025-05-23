import {
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Post,
  Put,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SongService } from './song.service';
import { UpdateSongDto } from './dto/update-song.dto';
import { CreateSongDto } from './dto/create-song.dto';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { Request } from 'express';

@ApiTags('songs')
@Controller('songs')
export class SongController {
  constructor(private readonly songService: SongService) {}

  @Post()
  @ApiOperation({ summary: 'Create song' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  create(@Req() req: Request, @Body() createSongDto: CreateSongDto) {
    const userId = (req.user as { userId: string }).userId;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.songService.create(userId ,createSongDto);
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
  @ApiOperation({ summary: 'Update song by the owner' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  update(@Req() req: Request ,@Param('id') id: string, @Body() updateDto: UpdateSongDto) {
    const userId = (req.user as { userId: string }).userId;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.songService.update(userId ,id, updateDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete song' })
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  remove(@Req() req: Request ,@Param('id') id: string) {
    const userId = (req.user as { userId: string }).userId;
    if (!userId) {
      throw new NotFoundException('User not found');
    }
    return this.songService.remove(userId,id);
  }
}

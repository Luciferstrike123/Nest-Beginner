import { Test, TestingModule } from '@nestjs/testing';
import { SongController } from 'src/song/song.controller';
import { SongService } from 'src/song/song.service';
import { CreateSongDto } from 'src/song/dto/create-song.dto';
import { UpdateSongDto } from 'src/song/dto/update-song.dto';
import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import * as request from 'supertest';
import { Server } from 'http';

describe('SongController', () => {
  let app: NestApplication;
  let songService: SongService;

  const mockSong = {
    id: '1',
    title: 'Test Song',
    fileUrl: 'http://example.com/song.mp3',
    duration: 180,
    playCount: 0,
    authorId: '550e8400-e29b-41d4-a716-446655440000',
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SongController],
      providers: [
        {
          provide: SongService,
          useValue: {
            create: jest.fn().mockResolvedValue(mockSong),
            findAll: jest.fn().mockResolvedValue([mockSong]),
            findOne: jest.fn().mockResolvedValue(mockSong),
            update: jest.fn().mockResolvedValue(mockSong),
            remove: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    songService = module.get<SongService>(SongService);
  });

  it('should create a new song - POST /songs', async () => {
    const createSongDto: CreateSongDto = {
      title: 'Test Song',
      fileUrl: 'http://example.com/song.mp3',
      duration: 180,
      playCount: 0,
      authorId: '550e8400-e29b-41d4-a716-446655440000',
    };
    const response = await request(app.getHttpServer() as Server)
      .post('/songs')
      .send(createSongDto);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(mockSong);
    const createSpy = jest.spyOn(songService, 'create');
    expect(createSpy).toHaveBeenCalledWith(createSongDto);
  });

  it('should get all songs - GET /songs', async () => {
    const response = await request(app.getHttpServer() as Server).get('/songs');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual([mockSong]);
    const findAllSpy = jest.spyOn(songService, 'findAll');
    expect(findAllSpy).toHaveBeenCalled();
  });

  it('should get a song by id - GET /songs/:id', async () => {
    const response = await request(app.getHttpServer() as Server).get(
      '/songs/1',
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(mockSong);
    const findOneSpy = jest.spyOn(songService, 'findOne');
    expect(findOneSpy).toHaveBeenCalledWith('1');
  });

  it('should update a song - PUT /songs/:id', async () => {
    const updateSongDto: UpdateSongDto = {
      title: 'Updated Song',
      duration: 200,
    };
    const response = await request(app.getHttpServer() as Server)
      .put('/songs/1')
      .send(updateSongDto);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(mockSong);
    const updateSpy = jest.spyOn(songService, 'update');
    expect(updateSpy).toHaveBeenCalledWith('1', updateSongDto);
  });

  it('should delete a song - DELETE /songs/:id', async () => {
    const response = await request(app.getHttpServer() as Server).delete(
      '/songs/1',
    );
    expect(response.status).toBe(HttpStatus.OK);
    const removeSpy = jest.spyOn(songService, 'remove');
    expect(removeSpy).toHaveBeenCalledWith('1');
  });

  afterAll(async () => {
    await app.close();
  });
});



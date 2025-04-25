import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm';
import { SongService } from 'src/song/song.service';
import { CreateSongDto } from 'src/song/dto/create-song.dto';
import { UpdateSongDto } from 'src/song/dto/update-song.dto';
import { Song } from 'src/entities/song.entity';

describe('SongService', () => {
    let songService: SongService;
    let songRepository: Repository<Song>;
  
    const mockSong = {
      id: '1',
      title: 'Test Song',
      fileUrl: 'http://example.com/song.mp3',
      duration: 180,
      playCount: 0,
      authorId: '550e8400-e29b-41d4-a716-446655440000',
      author: { id: '550e8400-e29b-41d4-a716-446655440000', username: 'author' },
      comments: [],
      likes: [],
    };
  
    const mockRepository = {
      create: jest.fn((dto: CreateSongDto) => ({ ...dto, id: '1' })),
      save: jest.fn().mockImplementation((song) => Promise.resolve(song)),
      find: jest.fn().mockResolvedValue([mockSong]),
      findOne: jest.fn().mockResolvedValue(mockSong),
      update: jest.fn().mockResolvedValue({ affected: 1 } as UpdateResult),
      delete: jest.fn().mockResolvedValue({ affected: 1 } as DeleteResult),
    };
  
    beforeEach(async () => {
      const module: TestingModule = await Test.createTestingModule({
        providers: [
          SongService,
          {
            provide: getRepositoryToken(Song),
            useValue: mockRepository,
          },
        ],
      }).compile();
  
      songService = module.get<SongService>(SongService);
      songRepository = module.get<Repository<Song>>(getRepositoryToken(Song));
    });
  
    afterEach(() => {
      jest.clearAllMocks();
    });
  
    describe('create', () => {
      it('should create a new song', async () => {
        const createSongDto: CreateSongDto = {
          title: 'Test Song',
          fileUrl: 'http://example.com/song.mp3',
          duration: 180,
          playCount: 0,
          authorId: '550e8400-e29b-41d4-a716-446655440000',
        };
        const result = await songService.create(createSongDto);
        expect(result).toEqual({ ...createSongDto, id: '1' });
        expect(songRepository.create).toHaveBeenCalledWith(createSongDto);
        expect(songRepository.save).toHaveBeenCalledWith({ ...createSongDto, id: '1' });
      });
    });
  
    describe('findAll', () => {
      it('should return an array of songs with relations', async () => {
        const result = await songService.findAll();
        expect(result).toEqual([mockSong]);
        expect(songRepository.find).toHaveBeenCalledWith({
          relations: ['author', 'comments', 'likes'],
        });
      });
    });
  
    describe('findOne', () => {
      it('should return a song by id with relations', async () => {
        const result = await songService.findOne('1');
        expect(result).toEqual(mockSong);
        expect(songRepository.findOne).toHaveBeenCalledWith({
          where: { id: '1' },
          relations: ['author', 'comments', 'likes'],
        });
      });
  
      it('should throw an error if song not found', async () => {
        mockRepository.findOne.mockResolvedValue(null);
        await expect(songService.findOne('2')).rejects.toThrow('Song with id 2 not found');
      });
    });
  
    describe('update', () => {
      it('should update a song', async () => {
        const updateSongDto: UpdateSongDto = { title: 'Updated Song', duration: 200 };
        const result = await songService.update('1', updateSongDto);
        expect(result).toEqual({ affected: 1 } as UpdateResult);
        expect(songRepository.update).toHaveBeenCalledWith('1', updateSongDto);
      });
    });
  
    describe('remove', () => {
      it('should delete a song', async () => {
        const result = await songService.remove('1');
        expect(result).toEqual({ affected: 1 } as DeleteResult);
        expect(songRepository.delete).toHaveBeenCalledWith('1');
      });
    });
  });
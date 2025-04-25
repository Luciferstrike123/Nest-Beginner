import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository, UpdateResult, DeleteResult } from 'typeorm'; 
import { UserService } from 'src/user/user.service'; 
import { CreateUserDto } from 'src/user/dto/create-user.dto'; 
import { UpdateUserDto } from 'src/user/dto/update-user.dto'; 
import { User } from 'src/entities/user.entity';
import { NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt'); // Mock bcrypt

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: '1',
    email: 'john@example.com',
    password: 'hashedPassword',
    username: 'john_doe',
    isPremium: false,
  };

  const mockRepository = {
    find: jest.fn().mockResolvedValue([mockUser]),
    findOneBy: jest.fn().mockResolvedValue(mockUser),
    save: jest.fn().mockResolvedValue(mockUser),
    update: jest.fn().mockResolvedValue({ affected: 1 } as UpdateResult),
    delete: jest.fn().mockResolvedValue({ affected: 1 } as DeleteResult),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const result = await userService.findAll();
      expect(result).toEqual([mockUser]);
      expect(userRepository.find).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      const result = await userService.findOne('1');
      expect(result).toEqual(mockUser);
      expect(userRepository.findOneBy).toHaveBeenCalledWith({ id: '1' });
    });

    it('should throw NotFoundException if user not found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      await expect(userService.findOne('2')).rejects.toThrow(
        new NotFoundException('User with id 2 not found'),
      );
    });
  });

  describe('create', () => {
    it('should create a new user with hashed password', async () => {
      const createUserDto: CreateUserDto = {
        email: 'john@example.com',
        password: 'password123',
        username: 'john_doe',
        isPremium: false,
      };
      const hashedPassword = 'hashedPassword';
      
      // Mock bcrypt
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await userService.create(createUserDto);
      expect(result).toEqual(mockUser);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 'salt');
      expect(userRepository.save).toHaveBeenCalledWith({
        ...createUserDto,
        password: hashedPassword,
      });
    });
  });

  describe('update', () => {
    it('should update a user without password', async () => {
      const updateUserDto: UpdateUserDto = { username: 'updated_john', isPremium: true };
      const result = await userService.update('1', updateUserDto);
      expect(result).toEqual({ affected: 1 } as UpdateResult);
      expect(userRepository.update).toHaveBeenCalledWith('1', updateUserDto);
      expect(bcrypt.hash).not.toHaveBeenCalled();
    });

    it('should update a user with hashed password', async () => {
      const updateUserDto: UpdateUserDto = { password: 'newPassword123' };
      const hashedPassword = 'newHashedPassword';
      
      // Mock bcrypt
      (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      const result = await userService.update('1', updateUserDto);
      expect(result).toEqual({ affected: 1 } as UpdateResult);
      expect(bcrypt.genSalt).toHaveBeenCalledWith(10);
      expect(bcrypt.hash).toHaveBeenCalledWith('newPassword123', 'salt');
      expect(userRepository.update).toHaveBeenCalledWith('1', {
        ...updateUserDto,
        password: hashedPassword,
      });
    });
  });

  describe('delete', () => {
    it('should delete a user', async () => {
      const result = await userService.delete('1');
      expect(result).toEqual({ affected: 1 } as DeleteResult);
      expect(userRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from 'src/user/user.controller'; 
import { UserService } from 'src/user/user.service'; 
import { CreateUserDto } from 'src/user/dto/create-user.dto'; 
import { UpdateUserDto } from 'src/user/dto/update-user.dto'; 
import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import * as request from 'supertest';

describe('UserController', () => {
  let app: NestApplication; // Khai báo type rõ ràng cho app
  let userService: UserService;

  const mockUser = {
    id: '1',
    email: 'john@example.com',
    username: 'john_doe',
    isPremium: false,
  };

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: {
            findAll: jest.fn().mockResolvedValue([]),
            findOne: jest.fn().mockResolvedValue(mockUser),
            create: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue({ affected: 1 }),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
          },
        },
      ],
    }).compile();

    app = module.createNestApplication();
    await app.init();
    userService = module.get<UserService>(UserService);
  });

  it('should get all users - GET /users', async () => {
    const response = await request(app.getHttpServer()).get('/users');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual([]);
    expect(userService.findAll).toHaveBeenCalled();
  });

  it('should get a user by id - GET /users/:id', async () => {
    const response = await request(app.getHttpServer()).get('/users/1');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(mockUser);
    expect(userService.findOne).toHaveBeenCalledWith('1');
  });

  it('should create a new user - POST /users', async () => {
    const createUserDto: CreateUserDto = {
      email: 'john@example.com',
      password: 'password123',
      username: 'john_doe',
      isPremium: false,
    };
    const response = await request(app.getHttpServer()).post('/users').send(createUserDto);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(mockUser);
    expect(userService.create).toHaveBeenCalledWith(createUserDto);
  });

  it('should update a user - PUT /users/:id', async () => {
    const updateUserDto: UpdateUserDto = { username: 'updated_john', isPremium: true };
    const response = await request(app.getHttpServer()).put('/users/1').send(updateUserDto);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({ affected: 1 });
    expect(userService.update).toHaveBeenCalledWith('1', updateUserDto);
  });

  it('should delete a user - DELETE /users/:id', async () => {
    const response = await request(app.getHttpServer()).delete('/users/1');
    expect(response.status).toBe(HttpStatus.OK);
    expect(userService.delete).toHaveBeenCalledWith('1');
  });

  afterAll(async () => {
    await app.close();
  });
});

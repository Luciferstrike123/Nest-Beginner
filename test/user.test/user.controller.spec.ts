import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from 'src/user/user.controller';
import { UserService } from 'src/user/user.service';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import { UpdateUserDto } from 'src/user/dto/update-user.dto';
import { HttpStatus } from '@nestjs/common';
import { NestApplication } from '@nestjs/core';
import * as request from 'supertest';
import { Server } from 'http';

describe('UserController', () => {
  let app: NestApplication;
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
    const response = await request(app.getHttpServer() as Server).get('/users');
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual([]);
    const findAllSpy = jest.spyOn(userService, 'findAll');
    expect(findAllSpy).toHaveBeenCalled();
  });

  it('should get a user by id - GET /users/:id', async () => {
    const response = await request(app.getHttpServer() as Server).get(
      '/users/1',
    );
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual(mockUser);
    const findOneSpy = jest.spyOn(userService, 'findOne');
    expect(findOneSpy).toHaveBeenCalledWith('1');
  });

  it('should create a new user - POST /users', async () => {
    const createUserDto: CreateUserDto = {
      email: 'john@example.com',
      password: 'password123',
      username: 'john_doe',
      isPremium: false,
    };
    const response = await request(app.getHttpServer() as Server)
      .post('/users')
      .send(createUserDto);
    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body).toEqual(mockUser);
    const createSpy = jest.spyOn(userService, 'create');
    expect(createSpy).toHaveBeenCalledWith(createUserDto);
  });

  it('should update a user - PUT /users/:id', async () => {
    const updateUserDto: UpdateUserDto = {
      username: 'updated_john',
      isPremium: true,
    };
    const response = await request(app.getHttpServer() as Server)
      .put('/users/1')
      .send(updateUserDto);
    expect(response.status).toBe(HttpStatus.OK);
    expect(response.body).toEqual({ affected: 1 });
    const updateSpy = jest.spyOn(userService, 'update');
    expect(updateSpy).toHaveBeenCalledWith('1', updateUserDto);
  });

  it('should delete a user - DELETE /users/:id', async () => {
    const response = await request(app.getHttpServer() as Server).delete(
      '/users/1',
    );
    expect(response.status).toBe(HttpStatus.OK);
    const deleteSpy = jest.spyOn(userService, 'delete');
    expect(deleteSpy).toHaveBeenCalledWith('1');
  });

  afterAll(async () => {
    await app.close();
  });
});

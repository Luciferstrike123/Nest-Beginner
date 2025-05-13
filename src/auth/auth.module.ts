// auth.module.ts
import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserService } from 'src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import { User } from 'src/entities/user.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [PassportModule, JwtModule.register({
    secret: process.env.JWT_SECRET || 'defaultSecret',
  }), TypeOrmModule.forFeature([User])],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService, UserService],
})
export class AuthModule {}

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
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from 'src/entities/user.entity';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt.auth.guard';
import { RolesGuard } from 'src/common/guards/role.guard';
import { Roles } from 'src/common/decorators/roles.decorator';
import { Role } from 'src/entities/enums/role.enum';
import { Request } from 'express';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('access-token')
  @Roles(Role.ADMIN)
  @Get('all')
  @ApiOperation({ summary: 'Get all users just for role admin' })
  findAll(): Promise<User[]> {
    return this.userService.findAll();
  }

  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('user')
  @ApiOperation({ summary: 'Get current user from token' })
  findOne(@Req() req: Request): Promise<any> {
    const id = (req.user as { userId: string }).userId;
    if (!id) {
      throw new NotFoundException('User not found');
    }
    return this.userService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a user' })
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.userService.create(createUserDto);
  }

  @Put('update')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Update a user' })
  update(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const id = (req.user as { userId: string }).userId;
    if (!id) {
      throw new NotFoundException('User not found');
    }
    return this.userService.update(id, updateUserDto);
  }

  @Delete('user')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Delete a user' })
  delete(@Req() req: Request) {
    const id = (req.user as { userId: string }).userId;
    if (!id) {
      throw new NotFoundException('User not found');
    }
    return this.userService.delete(id);
  }

  @Get('premium')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('access-token')
  @ApiOperation({ summary: 'Get premium user by id' })
  findTotalScrore(@Req() req: Request): Promise<{code: number, message: string, totalScore: number}> {
    const id = (req.user as { userId: string }).userId;
    if (!id) {
      throw new NotFoundException('User not found');
    }
    return this.userService.findTotalScore(id);
  }
}

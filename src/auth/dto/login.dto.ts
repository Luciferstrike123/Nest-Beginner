import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class LoginDto {
    @ApiProperty({
        description: 'The email address of the user',
        example: 'user1@gmail.com',
    })
    @IsString()
    email: string;

    @ApiProperty({
        description: 'The password of the user',
        example: '123',
    })
    @IsString()
    password: string;
}
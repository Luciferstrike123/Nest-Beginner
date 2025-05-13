import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";
import { LoginDto } from "./dto/login.dto";
import { Role } from "src/entities/enums/role.enum";
import { CreateUserDto } from "src/user/dto/create-user.dto";

@Injectable()
export class AuthService {
    constructor(
        private userService: UserService,
        private jwtService: JwtService
    ) {}

    async signUp(createUserDto: CreateUserDto){
        return this.userService.create(createUserDto);
    }
    
    async login(loginDto: LoginDto) {
        const user = await this.userService.validateUser(loginDto);
        if (!user) {
            throw new Error('Invalid credentials');
        }
        const payload:{email: string, userId:string, role: Role} = { email: user.email, userId: user.id, role: user.role };
        
        return {
            code: 200,
            message: 'Login successful',
            access_token: this.jwtService.sign(payload, { secret: process.env.JWT_SECRET || 'defaultSecret' }),
        };
    }
}
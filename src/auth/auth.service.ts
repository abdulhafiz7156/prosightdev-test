// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private usersService: UsersService,
    ) {}

    async login(username: string, password: string) {
        const user = await this.usersService.findUser(username);

        if (!user || user.password !== password) {
            throw new UnauthorizedException('Invalid username or password'); // ✅ Error for invalid creds
        }

        const payload = { username: user.username, role: user.role };
        const jwtSecret = this.configService.get<string>('JWT_KEY');
        const token = this.jwtService.sign(payload, { secret: jwtSecret, expiresIn: '1h' });

        return { access_token: token };
    }
}
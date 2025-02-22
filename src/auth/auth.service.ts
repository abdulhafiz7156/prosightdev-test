import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService, // ✅ Inject ConfigService
    ) {}

    async login(user: any) {
        const payload = { username: user.username, password: user.password, role: user.role };

        console.log('🔹 JWT Secret:', this.configService.get<string>('JWT_KEY'));
        // ✅ Load secret correctly
        const jwtSecret = this.configService.get<string>('JWT_KEY');

        console.log('🔹 Loaded JWT Secret:', jwtSecret);

        // ✅ Use NestJS `JwtService` instead of `jsonwebtoken`
        const token = this.jwtService.sign(payload, { secret: jwtSecret, expiresIn: '1h' });

        console.log('🔹 Generated Token:', token);

        return { access_token: token };
    }
}
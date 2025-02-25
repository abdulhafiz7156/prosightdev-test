import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(configService: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // ✅ Extracts token from Authorization header
            secretOrKey: configService.get<string>('JWT_KEY'),
        });
    }

    async validate(payload: any) {
        console.log('✅ JWT Payload:', payload); // Should print on protected route access
        return { username: payload.username, role: payload.role };
    }
}
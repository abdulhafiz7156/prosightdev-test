import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: `"" + ${process.env.JWT_KEY}`,
        });
    }

    async validate(payload: any) {
        console.log('✅ Validating JWT Payload:', payload); // 🔍 Debug log
        return payload; // ✅ This attaches `user` to the request
    }
}
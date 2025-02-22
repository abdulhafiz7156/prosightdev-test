import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private jwtService: JwtService) {
        super();
    }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        const authHeader = request.headers.authorization;

        if (!authHeader) {
            console.log('🚨 No Authorization Header');
            throw new UnauthorizedException('No authorization token provided');
        }

        const token = authHeader.split(' ')[1];
        try {
            const decoded = this.jwtService.verify(token, {
                secret: process.env.JWT_KEY, // ✅ Ensure you're using the correct secret
            });
            console.log('✅ Extracted User:', decoded);

            // Attach role to request object
            request.user = {
                id: decoded.id,
                username: decoded.username,
                role: decoded.role,  // Make sure role exists in token
            };

            return true;
        } catch (error) {
            console.error('🚨 Token Verification Failed:', error.message);
            throw new UnauthorizedException('Invalid token');
        }
    }
}


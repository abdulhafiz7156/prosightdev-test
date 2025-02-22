import { Controller, Get, UseGuards, Req } from '@nestjs/common';
import { Roles } from '../auth/guards/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Request } from 'express';

interface AuthenticatedRequest extends Request {
    user?: { username: string; role: string };
}

@Controller('users')
export class UsersController {
    @Get('profile')
    @UseGuards(JwtAuthGuard, RolesGuard)
    @Roles('admin')
    getProfile(@Req() req: AuthenticatedRequest) {
        console.log(req.user); // ✅ Debugging
        return { message: `You are an admin, ${req.user?.username}` };
    }
}
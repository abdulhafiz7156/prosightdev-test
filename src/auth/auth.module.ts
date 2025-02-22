import { Module } from '@nestjs/common';
import {JwtModule, JwtService} from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtStrategy } from './strategies/jwt.strategy';
import {AuthService} from "./auth.service";
import {AuthController} from "./auth.controller";

@Module({
  imports: [
    ConfigModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => {
        return {
          secret: configService.get<string>('JWT_KEY'),
          signOptions: { expiresIn: '1h' },
        };
      },
      inject: [ConfigService]
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService,  JwtStrategy],
  exports: [AuthService,  JwtModule],
})
export class AuthModule {}
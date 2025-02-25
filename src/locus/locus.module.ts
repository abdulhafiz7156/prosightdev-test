import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocusService } from './locus.service';
import { LocusController } from './locus.controller';
import { Locus } from './locus.entity';
import { LocusMember } from './locus-member.entity';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {JwtService} from "@nestjs/jwt";
import {JwtStrategy} from "../auth/strategies/jwt.strategy";
import {AuthService} from "../auth/auth.service";
import {UsersService} from "../users/users.service";
import {AuthModule} from "../auth/auth.module";

@Module({
  imports: [TypeOrmModule.forFeature([Locus, LocusMember]), AuthModule],
  controllers: [LocusController],
  providers: [LocusService],
})
export class LocusModule {}



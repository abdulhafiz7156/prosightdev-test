import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocusService } from './locus.service';
import { LocusController } from './locus.controller';
import { Locus } from './locus.entity';
import { LocusMember } from './locus-member.entity';
import {JwtAuthGuard} from "../auth/guards/jwt-auth.guard";
import {JwtService} from "@nestjs/jwt";
import {JwtStrategy} from "../auth/strategies/jwt.strategy";

@Module({
  imports: [TypeOrmModule.forFeature([Locus, LocusMember])],
  controllers: [LocusController],
  providers: [LocusService, JwtService, JwtAuthGuard, JwtStrategy],
})
export class LocusModule {}



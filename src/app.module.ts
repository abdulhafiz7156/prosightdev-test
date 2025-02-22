import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { LocusModule } from './locus/locus.module';
import { AppDataSource } from "./config/data-source";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(AppDataSource.options), // Database Connection
    TypeOrmModule.forFeature([]), // (Optional) Ensure repositories load correctly
    AuthModule,
    LocusModule,
  ],
})
export class AppModule {}
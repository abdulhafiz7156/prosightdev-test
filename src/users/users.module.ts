import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entity/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // ✅ Register the User entity
  providers: [UsersService],
  exports: [UsersService], // ✅ Export so other modules can use it
})
export class UsersModule {}
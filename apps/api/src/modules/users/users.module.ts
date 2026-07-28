import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { AccountController, UsersController } from './users.controller';

@Module({
  controllers: [AccountController, UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}

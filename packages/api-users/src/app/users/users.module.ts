import { Module } from '@nestjs/common';
import { DatabaseService } from '../database.service.js';
import { UsersController } from './users.controller.js';
import { UsersService } from './users.service.js';

@Module({
  controllers: [UsersController],
  providers: [DatabaseService, UsersService],
  exports: [UsersService],
})
export class UsersModule {}

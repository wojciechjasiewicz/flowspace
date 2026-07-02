import { Module } from '@nestjs/common';
import { DatabaseService } from '../database.service.js';
import { ChatController } from './chat.controller.js';
import { ChatService } from './chat.service.js';

@Module({
  controllers: [ChatController],
  providers: [DatabaseService, ChatService],
})
export class ChatModule {}

import { Body, Controller, Get, Param, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { z } from 'zod';
import { AuthGuard } from '@flowspace/auth';
import { ZodValidationPipe } from '@flowspace/nest-utils';
import { ChatService } from './chat.service.js';
import { createMessageSchema } from './chat.schemas.js';

type CreateMessageBody = z.infer<typeof createMessageSchema>;

@UseGuards(AuthGuard)
@Controller()
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('channels')
  listChannels() {
    return this.chatService.listChannels();
  }

  @Post('channels/dm/:otherUserId')
  findOrCreateDirectChannel(@Param('otherUserId') otherUserId: string, @Req() request: Request) {
    return this.chatService.findOrCreateDirectChannel(request.user!.sub, otherUserId);
  }

  @Get('channels/:channelId/messages')
  listMessages(@Param('channelId') channelId: string) {
    return this.chatService.listMessages(channelId);
  }

  @Post('channels/:channelId/messages')
  createMessage(
    @Param('channelId') channelId: string,
    @Body(new ZodValidationPipe(createMessageSchema)) body: CreateMessageBody,
    @Req() request: Request,
  ) {
    return this.chatService.createMessage(channelId, request.user!.sub, body.text);
  }
}

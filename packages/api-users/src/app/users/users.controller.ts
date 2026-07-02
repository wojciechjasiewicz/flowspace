import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import type { z } from 'zod';
import { AuthGuard } from '@flowspace/auth';
import { ZodValidationPipe } from '@flowspace/nest-utils';
import { UsersService } from './users.service.js';
import { createUserSchema } from './users.schemas.js';

type CreateUserBody = z.infer<typeof createUserSchema>;

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @UseGuards(AuthGuard)
  @Get()
  list() {
    return this.usersService.list();
  }

  @Post()
  create(@Body(new ZodValidationPipe(createUserSchema)) body: CreateUserBody) {
    return this.usersService.create(body);
  }
}

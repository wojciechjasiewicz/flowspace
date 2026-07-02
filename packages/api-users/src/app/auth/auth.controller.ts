import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import type { z } from 'zod';
import { AuthGuard } from '@flowspace/auth';
import { ZodValidationPipe } from '@flowspace/nest-utils';
import { AuthService } from './auth.service.js';
import { loginSchema } from './auth.schemas.js';

type LoginBody = z.infer<typeof loginSchema>;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body(new ZodValidationPipe(loginSchema)) body: LoginBody) {
    return this.authService.login(body);
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() request: Request) {
    return request.user;
  }
}

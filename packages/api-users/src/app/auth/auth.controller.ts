import { Body, Controller, Get, NotFoundException, Post, Req, Res, UseGuards } from '@nestjs/common';
import type { Request, Response } from 'express';
import type { z } from 'zod';
import { AUTH_COOKIE_MAX_AGE_MS, AUTH_COOKIE_NAME, AuthGuard } from '@flowspace/auth';
import { ZodValidationPipe } from '@flowspace/nest-utils';
import { UsersService } from '../users/users.service.js';
import { AuthService } from './auth.service.js';
import { loginSchema } from './auth.schemas.js';

type LoginBody = z.infer<typeof loginSchema>;

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('login')
  login(
    @Body(new ZodValidationPipe(loginSchema)) body: LoginBody,
    @Res({ passthrough: true }) response: Response,
  ) {
    const result = this.authService.login(body);
    response.cookie(AUTH_COOKIE_NAME, result.accessToken, {
      httpOnly: true,
      sameSite: 'lax',
      maxAge: AUTH_COOKIE_MAX_AGE_MS,
      path: '/',
    });
    return result;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(AUTH_COOKIE_NAME, { path: '/' });
    return { success: true };
  }

  @UseGuards(AuthGuard)
  @Get('me')
  me(@Req() request: Request) {
    const user = this.usersService.findById(request.user!.sub);
    if (!user) throw new NotFoundException('User not found');
    return user;
  }
}

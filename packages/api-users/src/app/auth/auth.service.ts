import { Injectable, UnauthorizedException } from '@nestjs/common';
import { createToken } from '@flowspace/auth';
import type { LoginInput, LoginResponse } from '@flowspace/models';
import { UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  login(input: LoginInput): LoginResponse {
    const user = this.usersService.findByEmailWithPassword(input.email);
    if (!user || !this.usersService.verifyPassword(input.password, user.passwordHash)) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = createToken(
      { sub: user.id, email: user.email, role: user.role },
      process.env.AUTH_SECRET || 'dev-secret-change-me',
    );

    const { id, email, name, role, createdAt } = user;
    return { accessToken, user: { id, email, name, role, createdAt } };
  }
}

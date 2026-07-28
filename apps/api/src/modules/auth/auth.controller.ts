import { Controller, Get, HttpCode, HttpStatus, Post, Req } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import {
  loginSchema,
  refreshTokenSchema,
  type LoginInput,
  type RefreshTokenInput,
} from '@rft360/shared';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser, type RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodBody } from '../../common/decorators/zod-body.decorator';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Public()
  // Tight limit: brute-force protection independent of the global throttle.
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with email + password' })
  login(@ZodBody(loginSchema) dto: LoginInput, @Req() req: Request) {
    return this.authService.login(dto, this.context(req));
  }

  @Public()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Exchange a refresh token for a new token pair' })
  refresh(@ZodBody(refreshTokenSchema) dto: RefreshTokenInput, @Req() req: Request) {
    return this.authService.refresh(dto.refreshToken, this.context(req));
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Revoke the current refresh token' })
  async logout(
    @ZodBody(refreshTokenSchema) dto: RefreshTokenInput,
    @CurrentUser('sub') userId: string,
    @Req() req: Request,
  ) {
    await this.authService.logout(dto.refreshToken, userId, req.ip);
  }

  @Get('me')
  @ApiOperation({ summary: 'Return the authenticated user’s profile' })
  me(@CurrentUser() user: RequestUser) {
    return this.usersService.getProfile(user.sub);
  }

  private context(req: Request) {
    return { ip: req.ip, userAgent: req.headers['user-agent'] };
  }
}

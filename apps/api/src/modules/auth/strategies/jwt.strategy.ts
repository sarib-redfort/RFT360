import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { JwtPayload } from '@rft360/shared';
import { PrismaService } from '../../../prisma/prisma.service';

/**
 * Validates the Bearer access token on protected routes.
 *
 * Beyond signature/expiry it re-checks the user still exists and is active, so
 * disabling an account takes effect immediately rather than at token expiry.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('jwt.secret')!,
    });
  }

  async validate(payload: JwtPayload): Promise<JwtPayload> {
    // A refresh token must never authenticate a normal request.
    if (payload.type !== 'access') {
      throw new UnauthorizedException('Invalid token type');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, isActive: true, role: true, email: true },
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Account is inactive or no longer exists');
    }
    // Return fresh role/email so a mid-session role change is honoured.
    return { sub: user.id, email: user.email, role: user.role, type: 'access' };
  }
}

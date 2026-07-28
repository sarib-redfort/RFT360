import {
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomUUID } from 'node:crypto';
import type {
  AuthTokens,
  JwtPayload,
  LoginInput,
  LoginResponse,
} from '@rft360/shared';
import { AuditAction } from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

interface RequestContext {
  ip?: string;
  userAgent?: string;
}

/**
 * Authentication service: credential verification, JWT issuance, and refresh
 * token rotation.
 *
 * Design notes:
 *  - Passwords are hashed with argon2id (memory-hard, the current OWASP pick).
 *  - Refresh tokens are opaque random strings; only their SHA-256 hash is
 *    stored, and each use rotates the token, so a stolen-and-replayed refresh
 *    token is detectable and the family can be revoked.
 *  - Login timing is levelled by always running a hash verification, even when
 *    the email is unknown, to blunt user-enumeration probing.
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  /** Dummy hash used to equalise timing when an account doesn't exist. */
  private readonly dummyHash =
    '$argon2id$v=19$m=65536,t=3,p=4$c29tZXNhbHRzb21lc2FsdA$RdescudvJCsgt3ub+b+dWRWJTmaaJObG';

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly audit: AuditService,
  ) {}

  static hashPassword(password: string): Promise<string> {
    return argon2.hash(password, { type: argon2.argon2id });
  }

  async validateCredentials(input: LoginInput) {
    const user = await this.prisma.user.findUnique({ where: { email: input.email } });

    if (!user) {
      // Spend the same time as a real verification to avoid a timing oracle.
      await argon2.verify(this.dummyHash, input.password).catch(() => undefined);
      throw new UnauthorizedException('Invalid email or password');
    }

    const valid = await argon2.verify(user.passwordHash, input.password).catch(() => false);
    if (!valid) throw new UnauthorizedException('Invalid email or password');
    if (!user.isActive) throw new UnauthorizedException('This account has been deactivated');

    return user;
  }

  async login(input: LoginInput, ctx: RequestContext = {}): Promise<LoginResponse> {
    const user = await this.validateCredentials(input);
    const tokens = await this.issueTokens(
      { sub: user.id, email: user.email, role: user.role },
      ctx,
    );

    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
    await this.audit.record({
      actorId: user.id,
      action: AuditAction.LOGIN,
      entityType: 'User',
      entityId: user.id,
      ip: ctx.ip,
    });

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatarUrl: null,
      },
    };
  }

  /** Verifies a refresh token, rotates it, and issues a fresh token pair. */
  async refresh(refreshToken: string, ctx: RequestContext = {}): Promise<AuthTokens> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
    if (payload.type !== 'refresh') throw new UnauthorizedException('Invalid token type');

    const tokenHash = this.hashToken(refreshToken);
    const stored = await this.prisma.refreshToken.findUnique({ where: { tokenHash } });

    if (!stored || stored.revokedAt || stored.expiresAt < new Date()) {
      // Token unknown/expired, or — critically — already used. Reuse of a
      // rotated token signals theft, so revoke every session for that user.
      if (stored?.revokedAt) {
        await this.prisma.refreshToken.updateMany({
          where: { userId: stored.userId, revokedAt: null },
          data: { revokedAt: new Date() },
        });
        this.logger.warn(`Refresh token reuse detected for user ${stored.userId}; sessions revoked`);
      }
      throw new UnauthorizedException('Invalid or expired refresh token');
    }

    const user = await this.prisma.user.findUnique({ where: { id: stored.userId } });
    if (!user || !user.isActive) throw new UnauthorizedException('Account is inactive');

    // Rotate: revoke the presented token, then mint a new pair.
    await this.prisma.refreshToken.update({
      where: { id: stored.id },
      data: { revokedAt: new Date() },
    });

    return this.issueTokens({ sub: user.id, email: user.email, role: user.role }, ctx);
  }

  /** Revokes a single refresh token (logout on this device). */
  async logout(refreshToken: string, actorId?: string, ip?: string): Promise<void> {
    const tokenHash = this.hashToken(refreshToken);
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    if (actorId) {
      await this.audit.record({
        actorId,
        action: AuditAction.LOGOUT,
        entityType: 'User',
        entityId: actorId,
        ip,
      });
    }
  }

  /** Revokes every active session for a user (e.g. after a password change). */
  async revokeAllSessions(userId: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  private async issueTokens(
    base: Pick<JwtPayload, 'sub' | 'email' | 'role'>,
    ctx: RequestContext,
  ): Promise<AuthTokens> {
    const accessExpiresIn = this.config.get<string>('jwt.expiresIn', '15m');
    const refreshExpiresIn = this.config.get<string>('jwt.refreshExpiresIn', '7d');

    const accessToken = await this.jwt.signAsync(
      { ...base, type: 'access' } satisfies JwtPayload,
      { secret: this.config.get<string>('jwt.secret'), expiresIn: accessExpiresIn as never },
    );

    // A jti makes each refresh token unique even for identical claims/second.
    const refreshToken = await this.jwt.signAsync(
      { ...base, type: 'refresh', jti: randomUUID() } as JwtPayload & { jti: string },
      { secret: this.config.get<string>('jwt.refreshSecret'), expiresIn: refreshExpiresIn as never },
    );

    await this.prisma.refreshToken.create({
      data: {
        userId: base.sub,
        tokenHash: this.hashToken(refreshToken),
        expiresAt: this.expiryDate(refreshExpiresIn),
        userAgent: ctx.userAgent?.slice(0, 255),
        ip: ctx.ip,
      },
    });

    return { accessToken, refreshToken, expiresIn: this.durationToSeconds(accessExpiresIn) };
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /** Converts a duration like `15m` / `7d` to an absolute expiry Date. */
  private expiryDate(duration: string): Date {
    return new Date(Date.now() + this.durationToSeconds(duration) * 1000);
  }

  private durationToSeconds(duration: string): number {
    const match = /^(\d+)([smhd])$/.exec(duration.trim());
    if (!match) return 900; // default 15 minutes
    const value = Number(match[1]);
    const unit = match[2];
    const multipliers: Record<string, number> = { s: 1, m: 60, h: 3600, d: 86400 };
    return value * (multipliers[unit] ?? 60);
  }
}

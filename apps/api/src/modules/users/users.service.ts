import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';
import {
  buildPaginationMeta,
  Role,
  ROLE_RANK,
  type ChangePasswordInput,
  type CreateUserInput,
  type ListQueryInput,
  type PaginatedResult,
  type UpdateProfileInput,
  type UpdateUserInput,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';

/** Columns safe to return to clients — never includes `passwordHash`. */
const publicUserSelect = {
  id: true,
  email: true,
  name: true,
  role: true,
  isActive: true,
  avatarId: true,
  lastLoginAt: true,
  createdAt: true,
  updatedAt: true,
} as const;

/**
 * CMS user management. Enforces two privilege-escalation guards throughout:
 *  - nobody may grant a role higher than their own, and
 *  - nobody may modify or delete an account that outranks them.
 */
@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: publicUserSelect,
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async list(query: ListQueryInput): Promise<PaginatedResult<unknown>> {
    const where: Record<string, unknown> = {};
    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        select: publicUserSelect,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id }, select: publicUserSelect });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async create(input: CreateUserInput, actorRole: Role) {
    this.assertCanAssignRole(actorRole, input.role);
    const passwordHash = await AuthService.hashPassword(input.password);
    return this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        role: input.role,
        isActive: input.isActive,
        avatarId: input.avatarId ?? undefined,
        passwordHash,
      },
      select: publicUserSelect,
    });
  }

  async update(id: string, input: UpdateUserInput, actorId: string, actorRole: Role) {
    const target = await this.getTargetOrThrow(id);
    this.assertCanManage(actorRole, target.role as Role, actorId, id);
    if (input.role) this.assertCanAssignRole(actorRole, input.role);

    // The last active super-admin must not be locked out or demoted.
    if ((input.isActive === false || (input.role && input.role !== Role.SUPER_ADMIN)) &&
        target.role === Role.SUPER_ADMIN) {
      await this.assertNotLastSuperAdmin(id);
    }

    return this.prisma.user.update({
      where: { id },
      data: {
        email: input.email,
        name: input.name,
        role: input.role,
        isActive: input.isActive,
        avatarId: input.avatarId === undefined ? undefined : input.avatarId,
      },
      select: publicUserSelect,
    });
  }

  async remove(id: string, actorId: string, actorRole: Role) {
    if (id === actorId) throw new BadRequestException('You cannot delete your own account');
    const target = await this.getTargetOrThrow(id);
    this.assertCanManage(actorRole, target.role as Role, actorId, id);
    if (target.role === Role.SUPER_ADMIN) await this.assertNotLastSuperAdmin(id);
    await this.prisma.user.delete({ where: { id } });
    return { id };
  }

  async updateProfile(userId: string, input: UpdateProfileInput) {
    return this.prisma.user.update({
      where: { id: userId },
      data: {
        name: input.name,
        avatarId: input.avatarId === undefined ? undefined : input.avatarId,
      },
      select: publicUserSelect,
    });
  }

  /** Self-service password change — requires the current password. */
  async changePassword(userId: string, input: ChangePasswordInput) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');
    const valid = await argon2.verify(user.passwordHash, input.currentPassword).catch(() => false);
    if (!valid) throw new BadRequestException('Current password is incorrect');

    const passwordHash = await AuthService.hashPassword(input.newPassword);
    await this.prisma.user.update({ where: { id: userId }, data: { passwordHash } });
    return { success: true };
  }

  /** Admin-initiated password reset for another user. */
  async resetPassword(id: string, newPassword: string, actorRole: Role, actorId: string) {
    const target = await this.getTargetOrThrow(id);
    this.assertCanManage(actorRole, target.role as Role, actorId, id);
    const passwordHash = await AuthService.hashPassword(newPassword);
    await this.prisma.user.update({ where: { id }, data: { passwordHash } });
    return { success: true };
  }

  private async getTargetOrThrow(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  /** An actor may only assign roles at or below their own rank. */
  private assertCanAssignRole(actorRole: Role, targetRole: Role) {
    if (ROLE_RANK[targetRole] > ROLE_RANK[actorRole]) {
      throw new ForbiddenException('You cannot assign a role higher than your own');
    }
  }

  /** An actor may manage themselves, or any account strictly below their rank. */
  private assertCanManage(actorRole: Role, targetRole: Role, actorId: string, targetId: string) {
    if (actorId === targetId) return;
    if (ROLE_RANK[targetRole] >= ROLE_RANK[actorRole]) {
      throw new ForbiddenException('You cannot manage an account at or above your own role');
    }
  }

  private async assertNotLastSuperAdmin(excludingId: string) {
    const remaining = await this.prisma.user.count({
      where: { role: Role.SUPER_ADMIN, isActive: true, id: { not: excludingId } },
    });
    if (remaining === 0) {
      throw new BadRequestException('At least one active super administrator must remain');
    }
  }
}

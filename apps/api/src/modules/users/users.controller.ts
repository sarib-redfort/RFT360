import { Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  changePasswordSchema,
  createUserSchema,
  listQuerySchema,
  resetUserPasswordSchema,
  Role,
  updateProfileSchema,
  updateUserSchema,
  type ChangePasswordInput,
  type CreateUserInput,
  type ListQueryInput,
  type ResetUserPasswordInput,
  type UpdateProfileInput,
  type UpdateUserInput,
} from '@rft360/shared';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser, type RequestUser } from '../../common/decorators/current-user.decorator';
import { ZodBody } from '../../common/decorators/zod-body.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { UsersService } from './users.service';

/** Every account holder can manage their own profile here. */
@ApiTags('Account')
@Controller('account')
export class AccountController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get my profile' })
  me(@CurrentUser('sub') userId: string) {
    return this.usersService.getProfile(userId);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update my profile' })
  updateProfile(
    @CurrentUser('sub') userId: string,
    @ZodBody(updateProfileSchema) dto: UpdateProfileInput,
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Post('me/change-password')
  @ApiOperation({ summary: 'Change my password' })
  changePassword(
    @CurrentUser('sub') userId: string,
    @ZodBody(changePasswordSchema) dto: ChangePasswordInput,
  ) {
    return this.usersService.changePassword(userId, dto);
  }
}

/** Managing other people's accounts requires ADMIN. */
@ApiTags('Admin · Users')
@Controller('admin/users')
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'List CMS users' })
  list(@Query(new ZodValidationPipe(listQuerySchema)) query: ListQueryInput) {
    return this.usersService.list(query);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a user by id' })
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a CMS user' })
  create(@ZodBody(createUserSchema) dto: CreateUserInput, @CurrentUser() actor: RequestUser) {
    return this.usersService.create(dto, actor.role as Role);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a user' })
  update(
    @Param('id') id: string,
    @ZodBody(updateUserSchema) dto: UpdateUserInput,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.usersService.update(id, dto, actor.sub, actor.role as Role);
  }

  @Post(':id/reset-password')
  @ApiOperation({ summary: "Reset another user's password" })
  resetPassword(
    @Param('id') id: string,
    @ZodBody(resetUserPasswordSchema) dto: ResetUserPasswordInput,
    @CurrentUser() actor: RequestUser,
  ) {
    return this.usersService.resetPassword(id, dto.newPassword, actor.role as Role, actor.sub);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a user' })
  remove(@Param('id') id: string, @CurrentUser() actor: RequestUser) {
    return this.usersService.remove(id, actor.sub, actor.role as Role);
  }
}

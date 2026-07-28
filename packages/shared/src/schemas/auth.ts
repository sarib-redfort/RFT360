import { z } from 'zod';
import { Role } from '../enums';
import { emailSchema, idSchema, passwordSchema } from './common';

/** Authentication and CMS user-management schemas. */

export const loginSchema = z.object({
  email: emailSchema,
  /**
   * Deliberately only checks presence. Applying the full password policy here
   * would tell an attacker which stored passwords are weak, and legacy accounts
   * must still be able to sign in.
   */
  password: z.string().min(1, 'Password is required').max(128),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: 'New password must differ from the current one',
    path: ['newPassword'],
  });
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

export const createUserSchema = z.object({
  email: emailSchema,
  name: z.string().trim().min(2, 'Name is required').max(120),
  password: passwordSchema,
  role: z.nativeEnum(Role).default(Role.EDITOR),
  isActive: z.boolean().default(true),
  avatarId: idSchema.nullish(),
});
export type CreateUserInput = z.infer<typeof createUserSchema>;

/**
 * Password is omitted — changing another user's password goes through the
 * dedicated reset endpoint so it is always audited separately.
 */
export const updateUserSchema = createUserSchema.omit({ password: true }).partial();
export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const resetUserPasswordSchema = z.object({
  newPassword: passwordSchema,
});
export type ResetUserPasswordInput = z.infer<typeof resetUserPasswordSchema>;

export const updateProfileSchema = z.object({
  name: z.string().trim().min(2, 'Name is required').max(120).optional(),
  avatarId: idSchema.nullish(),
});
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

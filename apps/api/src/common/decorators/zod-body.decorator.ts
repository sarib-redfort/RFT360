import { Body } from '@nestjs/common';
import { ZodSchema } from 'zod';
import { ZodValidationPipe } from '../pipes/zod-validation.pipe';

/**
 * Shorthand for `@Body(new ZodValidationPipe(schema))`.
 *
 * @example
 *   create(@ZodBody(postSchema) dto: PostInput) { ... }
 */
export const ZodBody = (schema: ZodSchema) => Body(new ZodValidationPipe(schema));

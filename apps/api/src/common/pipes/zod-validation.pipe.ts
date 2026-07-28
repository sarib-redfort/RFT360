import { PipeTransform, Injectable, ArgumentMetadata } from '@nestjs/common';
import { ZodSchema } from 'zod';

/**
 * Validates and coerces a request payload against a Zod schema from
 * `@rft360/shared`. On failure it throws the raw `ZodError`, which
 * {@link AllExceptionsFilter} turns into a 422 with field-level `details`.
 *
 * Used as a bound instance, e.g. `@Body(new ZodValidationPipe(postSchema))`, so
 * one schema definition validates both the API and the matching React form.
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    // parse (not safeParse) so a failure surfaces as a throwable ZodError.
    return this.schema.parse(value);
  }
}

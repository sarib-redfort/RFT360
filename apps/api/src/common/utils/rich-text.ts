import { sanitizeRichHtml } from './sanitize';

/**
 * Unpacks the editor's `{ json, html }` rich-text payload onto a pair of Prisma
 * columns (`<field>Json` + `<field>Html`), sanitising the HTML server-side.
 * Shared by every service that stores rich text so the mapping is written once.
 */
export function mapRichText(
  input: Record<string, unknown>,
  field: string,
): Record<string, unknown> {
  const value = input[field] as { json?: unknown; html?: string } | undefined;
  if (!value) return input;
  const { [field]: _omit, ...rest } = input;
  return {
    ...rest,
    [`${field}Json`]: value.json ?? undefined,
    [`${field}Html`]: sanitizeRichHtml(value.html),
  };
}

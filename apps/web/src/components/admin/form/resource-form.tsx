'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ContentStatus } from '@rft360/shared';
import type { ResourceConfig } from '@/lib/admin-resources';
import { saveResource, setStatus } from '@/app/admin/actions';
import { FieldRenderer } from './field-renderers';
import { cn } from '@/lib/utils';

/**
 * Generic create/edit form for any registry resource.
 *
 * Renders each configured field, holds the working values in local state, and
 * saves via the `saveResource` server action. Publishable resources also expose
 * Save-as-draft vs Save-and-publish. Rich-text/media/relation complexity lives
 * in the field renderers, so this component stays schema-agnostic.
 */
export function ResourceForm({
  config,
  resourceKey,
  record,
}: {
  config: ResourceConfig;
  resourceKey: string;
  record?: Record<string, unknown> | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState<Record<string, unknown>>(() => initialValues(config, record));

  const id = (record?.id as string) ?? null;
  const isEdit = Boolean(id);

  const setField = (name: string, value: unknown) =>
    setValues((prev) => ({ ...prev, [name]: value }));

  const submit = (publish?: boolean) =>
    startTransition(async () => {
      const payload = serialize(config, values);
      if (config.publishable && publish !== undefined) {
        payload.status = publish ? ContentStatus.PUBLISHED : ContentStatus.DRAFT;
      }
      const result = await saveResource(config.path, id, payload);
      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      // On publish of an existing draft, ensure the status transition fires.
      if (isEdit && publish && config.publishable) {
        await setStatus(config.path, id!, 'publish');
      }
      toast.success(isEdit ? 'Saved' : 'Created');
      router.push(`/admin/${resourceKey}`);
      router.refresh();
    });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit(config.publishable ? undefined : false);
      }}
      className="pb-24"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {config.fields.map((field) => (
          <div key={field.name} className={cn(field.full || isWide(field.type) ? 'md:col-span-2' : '')}>
            <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">
              {field.label}
              {field.required && <span className="text-[var(--accent)]"> *</span>}
            </label>
            <FieldRenderer
              field={field}
              value={values[field.name]}
              onChange={(v) => setField(field.name, v)}
              siblingValues={values}
            />
            {field.help && <p className="mt-1 text-xs text-[var(--text-muted)]">{field.help}</p>}
          </div>
        ))}
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--bg-card)] lg:pl-64">
        <div className="mx-auto flex max-w-6xl items-center justify-end gap-3 px-4 py-3 md:px-8">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)]"
          >
            Cancel
          </button>
          {config.publishable ? (
            <>
              <button
                type="button"
                disabled={pending}
                onClick={() => submit(false)}
                className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-primary)] disabled:opacity-50"
              >
                Save draft
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => submit(true)}
                className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
              >
                {pending ? 'Saving…' : 'Save & publish'}
              </button>
            </>
          ) : (
            <button
              type="submit"
              disabled={pending}
              className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)] disabled:opacity-50"
            >
              {pending ? 'Saving…' : 'Save'}
            </button>
          )}
        </div>
      </div>
    </form>
  );
}

function isWide(type: string) {
  return type === 'richtext' || type === 'string-array' || type === 'results';
}

/** Seed field values from an existing record (or sensible empties). */
function initialValues(config: ResourceConfig, record?: Record<string, unknown> | null) {
  const values: Record<string, unknown> = {};
  for (const field of config.fields) {
    if (record) {
      values[field.name] = mapIncoming(field.type, field.name, record);
    } else {
      values[field.name] = defaultFor(field.type);
    }
  }
  return values;
}

function mapIncoming(type: string, name: string, record: Record<string, unknown>) {
  if (type === 'richtext') {
    // Prisma stores <field>Json/<field>Html; reconstruct the editor value.
    return {
      json: record[`${name}Json`] ?? null,
      html: (record[`${name}Html`] as string) ?? '',
    };
  }
  if (type === 'tags') {
    const tags = record[name] as { id: string }[] | undefined;
    return tags?.map((t) => t.id) ?? [];
  }
  return record[name] ?? defaultFor(type);
}

function defaultFor(type: string) {
  switch (type) {
    case 'boolean':
      return false;
    case 'string-array':
    case 'results':
    case 'tags':
      return [];
    case 'richtext':
      return { json: null, html: '' };
    default:
      return '';
  }
}

/** Strip empties and normalise before sending to the API. */
function serialize(config: ResourceConfig, values: Record<string, unknown>) {
  const payload: Record<string, unknown> = {};
  for (const field of config.fields) {
    const v = values[field.name];
    if (v === '' || v === null || v === undefined) {
      // Skip blank optional fields so server defaults apply.
      if (!field.required) continue;
    }
    payload[field.name] = v;
  }
  return payload;
}

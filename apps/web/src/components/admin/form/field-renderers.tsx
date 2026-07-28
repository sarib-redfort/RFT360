'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import type { FieldConfig } from '@/lib/admin-resources';
import { clientGet } from '@/lib/admin-client';
import { mediaSrc } from '@/lib/utils';
import { slugify } from '@rft360/shared';
import { MediaPickerDialog } from '../media/media-picker-dialog';

// Tiptap is heavy + browser-only; load it lazily.
const TiptapEditor = dynamic(
  () => import('../editor/tiptap-editor').then((m) => m.TiptapEditor),
  { ssr: false, loading: () => <div className="h-80 rounded-lg border border-[var(--border)]" /> },
);

const inputClass =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-accent)]';

/** Renders a single field by its config type, wired to the form state. */
export function FieldRenderer({
  field,
  value,
  onChange,
  siblingValues,
}: {
  field: FieldConfig;
  value: unknown;
  onChange: (v: unknown) => void;
  siblingValues: Record<string, unknown>;
}) {
  switch (field.type) {
    case 'textarea':
      return (
        <textarea
          rows={4}
          className={`${inputClass} resize-y`}
          placeholder={field.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );

    case 'richtext':
      return (
        <TiptapEditor
          value={value as { json: unknown; html: string } | null}
          onChange={onChange}
          placeholder={field.placeholder}
        />
      );

    case 'boolean':
      return (
        <label className="inline-flex cursor-pointer items-center gap-2">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--accent)]"
            checked={Boolean(value)}
            onChange={(e) => onChange(e.target.checked)}
          />
          <span className="text-sm text-[var(--text-secondary)]">Enabled</span>
        </label>
      );

    case 'number':
      return (
        <input
          type="number"
          className={inputClass}
          value={(value as number | string) ?? ''}
          onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
        />
      );

    case 'date':
    case 'datetime':
      return (
        <input
          type={field.type === 'date' ? 'date' : 'datetime-local'}
          className={inputClass}
          value={toDateInput(value as string, field.type)}
          onChange={(e) => onChange(e.target.value ? new Date(e.target.value).toISOString() : null)}
        />
      );

    case 'select':
      return (
        <select className={inputClass} value={(value as string) ?? ''} onChange={(e) => onChange(e.target.value)}>
          <option value="">Select…</option>
          {field.options?.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      );

    case 'slug':
      return <SlugField field={field} value={value as string} onChange={onChange} siblingValues={siblingValues} />;

    case 'media':
      return <MediaField value={value as string | null} onChange={onChange} />;

    case 'string-array':
      return <StringArrayField value={(value as string[]) ?? []} onChange={onChange} />;

    case 'results':
      return <ResultsField value={(value as { label: string; value: string }[]) ?? []} onChange={onChange} />;

    case 'relation':
      return <RelationField field={field} value={value as string | null} onChange={onChange} />;

    case 'tags':
      return <TagsField field={field} value={(value as string[]) ?? []} onChange={onChange} />;

    case 'icon':
      return (
        <div>
          <input
            className={inputClass}
            placeholder="fa-solid fa-star"
            value={(value as string) ?? ''}
            onChange={(e) => onChange(e.target.value)}
          />
          {typeof value === 'string' && value && (
            <span className="mt-2 inline-flex items-center gap-2 text-sm text-[var(--text-muted)]">
              Preview: <i className={value} aria-hidden />
            </span>
          )}
        </div>
      );

    default:
      return (
        <input
          type="text"
          className={inputClass}
          placeholder={field.placeholder}
          value={(value as string) ?? ''}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
}

function toDateInput(value: string | undefined, type: string): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return type === 'date' ? d.toISOString().slice(0, 10) : d.toISOString().slice(0, 16);
}

function SlugField({
  field,
  value,
  onChange,
  siblingValues,
}: {
  field: FieldConfig;
  value: string;
  onChange: (v: string) => void;
  siblingValues: Record<string, unknown>;
}) {
  const source = field.slugFrom ? (siblingValues[field.slugFrom] as string) : '';
  return (
    <div className="flex gap-2">
      <input
        className={inputClass}
        placeholder="auto-generated-slug"
        value={value ?? ''}
        onChange={(e) => onChange(e.target.value)}
      />
      {field.slugFrom && (
        <button
          type="button"
          onClick={() => source && onChange(slugify(source))}
          className="whitespace-nowrap rounded-lg border border-[var(--border)] px-3 text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          From {field.slugFrom}
        </button>
      )}
    </div>
  );
}

function MediaField({ value, onChange }: { value: string | null; onChange: (v: string | null) => void }) {
  const [open, setOpen] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);

  // Resolve a preview for an existing id when the form loads.
  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }
    clientGet<{ storageKey: string; variants?: Record<string, { url?: string }> }>(`/admin/media/${value}`)
      .then((m) => setPreview(mediaSrc(m as never, 'thumbnail')))
      .catch(() => setPreview(null));
  }, [value]);

  return (
    <div className="flex items-center gap-3">
      <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)]">
        {preview ? (
          <Image src={preview} alt="" width={64} height={64} className="h-full w-full object-cover" />
        ) : (
          <i className="fa-regular fa-image text-[var(--text-muted)]" aria-hidden />
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
      >
        {value ? 'Change' : 'Choose image'}
      </button>
      {value && (
        <button type="button" onClick={() => onChange(null)} className="text-sm text-[var(--text-muted)] hover:text-red-600">
          Remove
        </button>
      )}
      {open && (
        <MediaPickerDialog
          onClose={() => setOpen(false)}
          onSelect={(media) => {
            onChange(media.id);
            setPreview(media.url);
            setOpen(false);
          }}
        />
      )}
    </div>
  );
}

function StringArrayField({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inputClass}
            value={item}
            onChange={(e) => {
              const next = [...value];
              next[i] = e.target.value;
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="rounded-lg border border-[var(--border)] px-3 text-[var(--text-muted)] hover:text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, ''])}
        className="text-sm font-semibold text-[var(--accent)]"
      >
        + Add item
      </button>
    </div>
  );
}

function ResultsField({
  value,
  onChange,
}: {
  value: { label: string; value: string }[];
  onChange: (v: { label: string; value: string }[]) => void;
}) {
  return (
    <div className="space-y-2">
      {value.map((item, i) => (
        <div key={i} className="flex gap-2">
          <input
            className={inputClass}
            placeholder="Label (e.g. Projects)"
            value={item.label}
            onChange={(e) => {
              const next = [...value];
              next[i] = { label: e.target.value, value: item.value };
              onChange(next);
            }}
          />
          <input
            className={inputClass}
            placeholder="Value (e.g. 20+)"
            value={item.value}
            onChange={(e) => {
              const next = [...value];
              next[i] = { label: item.label, value: e.target.value };
              onChange(next);
            }}
          />
          <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="rounded-lg border border-[var(--border)] px-3 text-[var(--text-muted)] hover:text-red-600"
          >
            ✕
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={() => onChange([...value, { label: '', value: '' }])}
        className="text-sm font-semibold text-[var(--accent)]"
      >
        + Add result
      </button>
    </div>
  );
}

interface Option {
  id: string;
  name?: string;
  title?: string;
}

function RelationField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string | null;
  onChange: (v: string | null) => void;
}) {
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    if (!field.optionsEndpoint) return;
    clientGet<{ data: Option[] } | Option[]>(field.optionsEndpoint, { limit: '100' })
      .then((res) => setOptions(Array.isArray(res) ? res : res.data))
      .catch(() => setOptions([]));
  }, [field.optionsEndpoint]);

  return (
    <select className={inputClass} value={value ?? ''} onChange={(e) => onChange(e.target.value || null)}>
      <option value="">None</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name ?? opt.title ?? opt.id}
        </option>
      ))}
    </select>
  );
}

function TagsField({
  field,
  value,
  onChange,
}: {
  field: FieldConfig;
  value: string[];
  onChange: (v: string[]) => void;
}) {
  const [options, setOptions] = useState<Option[]>([]);
  useEffect(() => {
    if (!field.optionsEndpoint) return;
    clientGet<{ data: Option[] } | Option[]>(field.optionsEndpoint, { limit: '100' })
      .then((res) => setOptions(Array.isArray(res) ? res : res.data))
      .catch(() => setOptions([]));
  }, [field.optionsEndpoint]);

  const toggle = (id: string) =>
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);

  return (
    <div className="flex flex-wrap gap-2">
      {options.length === 0 && <span className="text-sm text-[var(--text-muted)]">No tags yet.</span>}
      {options.map((opt) => (
        <button
          key={opt.id}
          type="button"
          onClick={() => toggle(opt.id)}
          className={`rounded-full border px-3 py-1 text-xs font-medium ${
            value.includes(opt.id)
              ? 'border-[var(--accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
              : 'border-[var(--border)] text-[var(--text-secondary)]'
          }`}
        >
          {opt.name ?? opt.title}
        </button>
      ))}
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { toast } from 'sonner';
import { saveResource } from '@/app/admin/actions';

const TiptapEditor = dynamic(
  () => import('@/components/admin/editor/tiptap-editor').then((m) => m.TiptapEditor),
  { ssr: false, loading: () => <div className="h-80 rounded-lg border border-[var(--border)]" /> },
);

const input =
  'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-accent)]';

/** Dedicated page editor — hero fields, rich-text body and nested SEO. */
export function PageEditor({ record }: { record: Record<string, unknown> }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [values, setValues] = useState({
    eyebrow: (record.eyebrow as string) ?? '',
    heading: (record.heading as string) ?? '',
    headingAccent: (record.headingAccent as string) ?? '',
    subheading: (record.subheading as string) ?? '',
    metaTitle: (record.metaTitle as string) ?? '',
    metaDescription: (record.metaDescription as string) ?? '',
    body: { json: record.bodyJson ?? null, html: (record.bodyHtml as string) ?? '' },
  });

  const set = (k: string, v: unknown) => setValues((prev) => ({ ...prev, [k]: v }));

  const save = () =>
    startTransition(async () => {
      const payload = {
        eyebrow: values.eyebrow,
        heading: values.heading,
        headingAccent: values.headingAccent,
        subheading: values.subheading,
        body: values.body,
        seo: { metaTitle: values.metaTitle, metaDescription: values.metaDescription },
      };
      const result = await saveResource('pages', record.id as string, payload);
      if (result.ok) {
        toast.success('Page saved');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });

  return (
    <div className="space-y-5 pb-24">
      <Field label="Eyebrow">
        <input className={input} value={values.eyebrow} onChange={(e) => set('eyebrow', e.target.value)} />
      </Field>
      <Field label="Heading">
        <input className={input} value={values.heading} onChange={(e) => set('heading', e.target.value)} />
      </Field>
      <Field label="Heading accent (shown in red)">
        <input
          className={input}
          value={values.headingAccent}
          onChange={(e) => set('headingAccent', e.target.value)}
          placeholder="e.g. a workplace"
        />
      </Field>
      <Field label="Subheading">
        <textarea rows={2} className={`${input} resize-y`} value={values.subheading} onChange={(e) => set('subheading', e.target.value)} />
      </Field>
      <Field label="Body">
        <TiptapEditor value={values.body} onChange={(v) => set('body', v)} />
      </Field>

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h2 className="mb-3 font-semibold text-[var(--text-primary)]">SEO</h2>
        <Field label="Meta title">
          <input className={input} value={values.metaTitle} onChange={(e) => set('metaTitle', e.target.value)} />
        </Field>
        <Field label="Meta description" className="mt-3">
          <textarea rows={2} className={`${input} resize-y`} value={values.metaDescription} onChange={(e) => set('metaDescription', e.target.value)} />
        </Field>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--bg-card)] lg:pl-64">
        <div className="mx-auto flex max-w-6xl justify-end px-4 py-3 md:px-8">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save page'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={className}>
      <label className="mb-1.5 block text-sm font-semibold text-[var(--text-primary)]">{label}</label>
      {children}
    </div>
  );
}

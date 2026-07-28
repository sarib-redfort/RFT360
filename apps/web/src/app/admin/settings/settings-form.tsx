'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { saveSettings } from '@/app/admin/actions';

interface Settings {
  [key: string]: unknown;
}

const GROUPS: { title: string; fields: { name: string; label: string; type?: string }[] }[] = [
  {
    title: 'General',
    fields: [
      { name: 'siteName', label: 'Site name' },
      { name: 'tagline', label: 'Tagline' },
      { name: 'description', label: 'Description', type: 'textarea' },
    ],
  },
  {
    title: 'Contact',
    fields: [
      { name: 'contactEmail', label: 'Contact email' },
      { name: 'contactPhone', label: 'Contact phone' },
      { name: 'addressLine1', label: 'Address' },
      { name: 'city', label: 'City' },
      { name: 'country', label: 'Country' },
      { name: 'officeHours', label: 'Office hours' },
      { name: 'mapEmbedUrl', label: 'Map embed URL' },
    ],
  },
  {
    title: 'Social',
    fields: [
      { name: 'socialLinkedin', label: 'LinkedIn' },
      { name: 'socialFacebook', label: 'Facebook' },
      { name: 'socialInstagram', label: 'Instagram' },
      { name: 'socialTwitter', label: 'X / Twitter' },
      { name: 'socialYoutube', label: 'YouTube' },
    ],
  },
  {
    title: 'Footer',
    fields: [
      { name: 'footerText', label: 'Footer text', type: 'textarea' },
      { name: 'copyrightText', label: 'Copyright text' },
    ],
  },
  {
    title: 'SEO defaults',
    fields: [
      { name: 'metaTitle', label: 'Meta title' },
      { name: 'metaDescription', label: 'Meta description', type: 'textarea' },
      { name: 'metaKeywords', label: 'Meta keywords' },
    ],
  },
  {
    title: 'Analytics',
    fields: [
      { name: 'googleAnalyticsId', label: 'Google Analytics ID' },
      { name: 'googleTagManagerId', label: 'Google Tag Manager ID' },
      { name: 'facebookPixelId', label: 'Facebook Pixel ID' },
    ],
  },
];

/** Site-settings editor grouped into sections. */
export function SettingsForm({ initial }: { initial: Settings }) {
  const router = useRouter();
  const [values, setValues] = useState<Settings>(initial);
  const [pending, startTransition] = useTransition();

  const inputClass =
    'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none focus:border-[var(--border-accent)]';

  const save = () =>
    startTransition(async () => {
      // Only send the editable string fields.
      const payload: Settings = {};
      for (const group of GROUPS) for (const f of group.fields) payload[f.name] = values[f.name] ?? '';
      payload.maintenanceMode = values.maintenanceMode ?? false;
      const result = await saveSettings(payload);
      if (result.ok) {
        toast.success('Settings saved');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });

  return (
    <div className="space-y-8 pb-24">
      {GROUPS.map((group) => (
        <section key={group.title} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
          <h2 className="mb-4 font-[var(--font-heading)] text-lg font-semibold text-[var(--text-primary)]">
            {group.title}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {group.fields.map((field) => (
              <div key={field.name} className={field.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <label className="mb-1.5 block text-sm font-medium text-[var(--text-secondary)]">
                  {field.label}
                </label>
                {field.type === 'textarea' ? (
                  <textarea
                    rows={3}
                    className={`${inputClass} resize-y`}
                    value={(values[field.name] as string) ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  />
                ) : (
                  <input
                    className={inputClass}
                    value={(values[field.name] as string) ?? ''}
                    onChange={(e) => setValues((v) => ({ ...v, [field.name]: e.target.value }))}
                  />
                )}
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <label className="flex items-center gap-3">
          <input
            type="checkbox"
            className="h-4 w-4 accent-[var(--accent)]"
            checked={Boolean(values.maintenanceMode)}
            onChange={(e) => setValues((v) => ({ ...v, maintenanceMode: e.target.checked }))}
          />
          <span className="text-sm font-medium text-[var(--text-primary)]">Maintenance mode</span>
        </label>
      </section>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[var(--border)] bg-[var(--bg-card)] lg:pl-64">
        <div className="mx-auto flex max-w-6xl justify-end px-4 py-3 md:px-8">
          <button
            type="button"
            onClick={save}
            disabled={pending}
            className="rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {pending ? 'Saving…' : 'Save settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { saveNavItem, deleteNavItem } from '@/app/admin/actions';

interface NavItem {
  id: string;
  label: string;
  href?: string | null;
  location: string;
  order: number;
}

/** Header/footer navigation builder — add, edit, delete and order links. */
export function NavigationManager({ initial }: { initial: NavItem[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();
  const [draft, setDraft] = useState<{ label: string; href: string; location: string }>({
    label: '',
    href: '',
    location: 'HEADER',
  });

  const refresh = () => {
    router.refresh();
  };

  const add = () =>
    startTransition(async () => {
      if (!draft.label || !draft.href) {
        toast.error('Label and link are required');
        return;
      }
      const order = items.filter((i) => i.location === draft.location).length;
      const result = await saveNavItem(null, { ...draft, order });
      if (result.ok) {
        toast.success('Added');
        setDraft({ label: '', href: '', location: draft.location });
        refresh();
      } else {
        toast.error(result.error);
      }
    });

  const remove = (id: string) =>
    startTransition(async () => {
      const result = await deleteNavItem(id);
      if (result.ok) {
        setItems((cur) => cur.filter((i) => i.id !== id));
        toast.success('Removed');
      } else {
        toast.error(result.error);
      }
    });

  const rename = (id: string, label: string, href: string) =>
    startTransition(async () => {
      const result = await saveNavItem(id, { label, href });
      if (result.ok) toast.success('Saved');
      else toast.error(result.error);
    });

  const input = 'rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm';

  return (
    <div className="space-y-8">
      {(['HEADER', 'FOOTER'] as const).map((location) => (
        <section key={location} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <h2 className="mb-4 font-[var(--font-heading)] text-lg font-semibold capitalize text-[var(--text-primary)]">
            {location.toLowerCase()} menu
          </h2>
          <ul className="space-y-2">
            {items
              .filter((i) => i.location === location)
              .map((item) => (
                <li key={item.id} className="flex items-center gap-2">
                  <input
                    className={`${input} w-40`}
                    defaultValue={item.label}
                    onBlur={(e) => rename(item.id, e.target.value, item.href ?? '')}
                  />
                  <input
                    className={`${input} flex-1`}
                    defaultValue={item.href ?? ''}
                    onBlur={(e) => rename(item.id, item.label, e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    disabled={pending}
                    className="rounded-lg border border-[var(--border)] px-3 py-2 text-[var(--text-muted)] hover:text-red-600"
                  >
                    <i className="fa-solid fa-trash text-xs" aria-hidden />
                  </button>
                </li>
              ))}
          </ul>
        </section>
      ))}

      <section className="rounded-2xl border border-dashed border-[var(--border)] p-5">
        <h2 className="mb-3 font-semibold text-[var(--text-primary)]">Add link</h2>
        <div className="flex flex-wrap items-end gap-2">
          <input
            className={`${input} w-40`}
            placeholder="Label"
            value={draft.label}
            onChange={(e) => setDraft({ ...draft, label: e.target.value })}
          />
          <input
            className={`${input} flex-1`}
            placeholder="/path or https://…"
            value={draft.href}
            onChange={(e) => setDraft({ ...draft, href: e.target.value })}
          />
          <select
            className={input}
            value={draft.location}
            onChange={(e) => setDraft({ ...draft, location: e.target.value })}
          >
            <option value="HEADER">Header</option>
            <option value="FOOTER">Footer</option>
          </select>
          <button
            type="button"
            onClick={add}
            disabled={pending}
            className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Add
          </button>
        </div>
      </section>
    </div>
  );
}

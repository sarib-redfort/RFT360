'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateSubmissionStatus } from '@/app/admin/actions';

const STATUSES = ['NEW', 'READ', 'REPLIED', 'ARCHIVED', 'SPAM'];

/** Status selector + reply shortcut for a contact submission. */
export function SubmissionActions({
  id,
  email,
  currentStatus,
}: {
  id: string;
  email: string;
  currentStatus: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const change = (status: string) =>
    startTransition(async () => {
      const result = await updateSubmissionStatus(id, status);
      if (result.ok) {
        toast.success('Status updated');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });

  return (
    <div className="flex flex-wrap items-center gap-3">
      <label className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">Status</label>
      <select
        disabled={pending}
        defaultValue={currentStatus}
        onChange={(e) => change(e.target.value)}
        className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm"
      >
        {STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <a
        href={`mailto:${email}`}
        className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white"
      >
        <i className="fa-solid fa-reply text-xs" aria-hidden /> Reply
      </a>
    </div>
  );
}

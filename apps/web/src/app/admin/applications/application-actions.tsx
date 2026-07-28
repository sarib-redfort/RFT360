'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { updateApplicationStatus } from '@/app/admin/actions';

const STATUSES = ['NEW', 'REVIEWING', 'SHORTLISTED', 'INTERVIEWING', 'OFFERED', 'HIRED', 'REJECTED', 'WITHDRAWN'];

/** Pipeline status selector for a job application. */
export function ApplicationActions({ id, currentStatus }: { id: string; currentStatus: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <select
      disabled={pending}
      defaultValue={currentStatus}
      onChange={(e) =>
        startTransition(async () => {
          const result = await updateApplicationStatus(id, e.target.value);
          if (result.ok) {
            toast.success('Status updated');
            router.refresh();
          } else {
            toast.error(result.error);
          }
        })
      }
      className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-1.5 text-sm"
    >
      {STATUSES.map((s) => (
        <option key={s} value={s}>
          {s}
        </option>
      ))}
    </select>
  );
}

import { adminGet } from '@/lib/admin-api';
import { formatDate } from '@/lib/utils';
import { StatusBadge } from '@/components/admin/status-badge';
import { SubmissionActions } from './submission-actions';
import type { PaginatedResult } from '@rft360/shared';

interface Submission {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  subject?: string | null;
  message: string;
  status: string;
  createdAt: string;
}

/** Contact-form inbox with status management and CSV export. */
export default async function SubmissionsPage() {
  const result = await adminGet<PaginatedResult<Submission>>('/admin/submissions', { limit: 100 }).catch(
    () => ({ data: [] as Submission[], meta: null }),
  );
  const submissions = result.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold">Messages</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">{submissions.length} total</p>
        </div>
        <a
          href="/api/admin-proxy/admin/submissions/export"
          download="submissions.csv"
          className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
        >
          <i className="fa-solid fa-download text-xs" aria-hidden /> Export CSV
        </a>
      </div>

      <div className="mt-6 space-y-3">
        {submissions.length === 0 ? (
          <p className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-16 text-center text-sm text-[var(--text-muted)]">
            No messages yet.
          </p>
        ) : (
          submissions.map((s) => (
            <details key={s.id} className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--text-primary)]">
                      {s.firstName} {s.lastName}
                    </span>
                    <StatusBadge status={s.status} />
                  </div>
                  <p className="truncate text-sm text-[var(--text-muted)]">
                    {s.subject || 'Contact enquiry'} · {s.email}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-[var(--text-muted)]">
                  {formatDate(s.createdAt)}
                </span>
              </summary>
              <div className="border-t border-[var(--border)] px-5 py-4">
                <dl className="grid gap-2 text-sm sm:grid-cols-2">
                  <Info label="Email" value={s.email} />
                  {s.phone && <Info label="Phone" value={s.phone} />}
                  {s.company && <Info label="Company" value={s.company} />}
                </dl>
                <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{s.message}</p>
                <div className="mt-4">
                  <SubmissionActions id={s.id} email={s.email} currentStatus={s.status} />
                </div>
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">{label}</dt>
      <dd className="text-[var(--text-primary)]">{value}</dd>
    </div>
  );
}

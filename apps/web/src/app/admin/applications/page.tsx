import { adminGet } from '@/lib/admin-api';
import { formatDate, mediaUrl } from '@/lib/utils';
import { StatusBadge } from '@/components/admin/status-badge';
import { ApplicationActions } from './application-actions';
import type { PaginatedResult } from '@rft360/shared';

interface Application {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  linkedinUrl?: string | null;
  yearsOfExperience?: number | null;
  coverLetter?: string | null;
  status: string;
  createdAt: string;
  job?: { title: string } | null;
  resume?: { storageKey: string } | null;
}

/** Recruiter inbox for job applications. */
export default async function ApplicationsPage() {
  const result = await adminGet<PaginatedResult<Application>>('/admin/applications', {
    limit: 100,
  }).catch(() => ({ data: [] as Application[], meta: null }));
  const applications = result.data ?? [];

  return (
    <div>
      <h1 className="font-[var(--font-heading)] text-2xl font-bold">Applications</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--text-secondary)]">{applications.length} total</p>

      <div className="space-y-3">
        {applications.length === 0 ? (
          <p className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-16 text-center text-sm text-[var(--text-muted)]">
            No applications yet.
          </p>
        ) : (
          applications.map((a) => (
            <details key={a.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
              <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-[var(--text-primary)]">
                      {a.firstName} {a.lastName}
                    </span>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="truncate text-sm text-[var(--text-muted)]">
                    {a.job?.title ?? 'Unknown role'} · {a.email}
                  </p>
                </div>
                <span className="whitespace-nowrap text-xs text-[var(--text-muted)]">{formatDate(a.createdAt)}</span>
              </summary>
              <div className="border-t border-[var(--border)] px-5 py-4">
                <dl className="grid gap-2 text-sm sm:grid-cols-3">
                  <Info label="Phone" value={a.phone} />
                  {a.yearsOfExperience != null && <Info label="Experience" value={`${a.yearsOfExperience} yrs`} />}
                  {a.linkedinUrl && (
                    <div>
                      <dt className="text-xs uppercase tracking-wide text-[var(--text-muted)]">LinkedIn</dt>
                      <dd>
                        <a href={a.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--accent)]">
                          Profile
                        </a>
                      </dd>
                    </div>
                  )}
                </dl>
                {a.coverLetter && (
                  <p className="mt-4 whitespace-pre-wrap text-sm text-[var(--text-secondary)]">{a.coverLetter}</p>
                )}
                <div className="mt-4 flex flex-wrap items-center gap-3">
                  {a.resume?.storageKey && (
                    <a
                      href={mediaUrl(a.resume.storageKey) ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
                    >
                      <i className="fa-solid fa-file-arrow-down text-xs" aria-hidden /> Download CV
                    </a>
                  )}
                  <ApplicationActions id={a.id} currentStatus={a.status} />
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

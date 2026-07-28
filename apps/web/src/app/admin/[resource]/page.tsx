import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PaginatedResult } from '@rft360/shared';
import { getResource } from '@/lib/admin-resources';
import { adminGet } from '@/lib/admin-api';
import { StatusBadge } from '@/components/admin/status-badge';
import { ResourceRowActions } from '@/components/admin/resource-row-actions';

/**
 * Generic resource list. Driven by the resource registry so every simple
 * content type gets the same table + actions. Explicit admin routes
 * (media, settings, homepage, …) take precedence over this dynamic segment.
 */
export default async function ResourceListPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await params;
  const config = getResource(key);
  if (!config) notFound();

  const result = await adminGet<PaginatedResult<Record<string, unknown>>>(`/admin/${config.path}`, {
    limit: 100,
  }).catch(() => ({ data: [], meta: null }));
  const rows = result.data ?? [];

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-[var(--font-heading)] text-2xl font-bold">{config.label}</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {rows.length} {rows.length === 1 ? 'item' : 'items'}
          </p>
        </div>
        <div className="flex gap-2">
          {config.orderable && rows.length > 1 && (
            <Link
              href={`/admin/${key}/reorder`}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-4 py-2 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            >
              <i className="fa-solid fa-arrows-up-down text-xs" aria-hidden /> Reorder
            </Link>
          )}
          <Link
            href={`/admin/${key}/new`}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white hover:bg-[var(--accent-hover)]"
          >
            <i className="fa-solid fa-plus text-xs" aria-hidden /> New {config.labelSingular}
          </Link>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        {rows.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-[var(--text-muted)]">
            No {config.label.toLowerCase()} yet. Create your first one.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
                {config.listColumns.map((col) => (
                  <th key={col.field} className="px-5 py-3 font-semibold">
                    {col.label}
                  </th>
                ))}
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {rows.map((row) => (
                <tr key={String(row.id)} className="hover:bg-[var(--bg-card-hover)]">
                  {config.listColumns.map((col, i) => (
                    <td key={col.field} className="px-5 py-3">
                      {col.field === 'status' ? (
                        <StatusBadge status={String(row.status ?? 'DRAFT')} />
                      ) : i === 0 ? (
                        <Link
                          href={`/admin/${key}/${String(row.id)}`}
                          className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)]"
                        >
                          {String(row[col.field] ?? '—')}
                        </Link>
                      ) : (
                        <span className="text-[var(--text-secondary)]">
                          {String(row[col.field] ?? '—')}
                        </span>
                      )}
                    </td>
                  ))}
                  <td className="px-5 py-3">
                    <ResourceRowActions
                      path={config.path}
                      resourceKey={key}
                      id={String(row.id)}
                      status={row.status as string | undefined}
                      publishable={config.publishable}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

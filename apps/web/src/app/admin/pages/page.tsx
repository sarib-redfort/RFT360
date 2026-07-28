import Link from 'next/link';
import { adminGet } from '@/lib/admin-api';
import type { PaginatedResult } from '@rft360/shared';
import { StatusBadge } from '@/components/admin/status-badge';

interface PageRow {
  id: string;
  slug: string;
  title: string;
  status: string;
}

/** Pages list — the eight planner pages' hero copy + SEO. */
export default async function PagesListPage() {
  const result = await adminGet<PaginatedResult<PageRow>>('/admin/pages', { limit: 50 }).catch(() => ({
    data: [] as PageRow[],
    meta: null,
  }));
  const pages = result.data ?? [];

  return (
    <div>
      <h1 className="font-[var(--font-heading)] text-2xl font-bold">Pages</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--text-secondary)]">
        Edit each page’s hero copy, body and SEO. These map to the site’s main routes.
      </p>
      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        {pages.length === 0 ? (
          <p className="px-6 py-16 text-center text-sm text-[var(--text-muted)]">
            No pages found. Run the seed to create them.
          </p>
        ) : (
          <table className="w-full text-sm">
            <tbody className="divide-y divide-[var(--border)]">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-[var(--bg-card-hover)]">
                  <td className="px-5 py-3">
                    <Link href={`/admin/pages/${page.id}`} className="font-medium text-[var(--text-primary)] hover:text-[var(--accent)]">
                      {page.title}
                    </Link>
                    <span className="ml-2 text-xs text-[var(--text-muted)]">/{page.slug}</span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <StatusBadge status={page.status} />
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

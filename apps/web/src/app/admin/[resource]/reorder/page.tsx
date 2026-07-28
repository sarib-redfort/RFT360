import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { PaginatedResult } from '@rft360/shared';
import { getResource } from '@/lib/admin-resources';
import { adminGet } from '@/lib/admin-api';
import { SortableList } from '@/components/admin/sortable-list';

/** Drag-to-reorder view for an orderable resource. */
export default async function ReorderPage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await params;
  const config = getResource(key);
  if (!config || !config.orderable) notFound();

  const result = await adminGet<PaginatedResult<Record<string, unknown>>>(`/admin/${config.path}`, {
    limit: 100,
  }).catch(() => ({ data: [] as Record<string, unknown>[] }));

  const labelField = config.listColumns[0]?.field ?? 'title';
  const items = (result.data ?? []).map((row) => ({
    id: String(row.id),
    label: String(row[labelField] ?? row.title ?? row.name ?? row.id),
  }));

  return (
    <div className="max-w-2xl">
      <Link href={`/admin/${key}`} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        ← {config.label}
      </Link>
      <h1 className="mb-2 mt-2 font-[var(--font-heading)] text-2xl font-bold">Reorder {config.label}</h1>
      <p className="mb-6 text-sm text-[var(--text-secondary)]">
        Drag items into the order they should appear on the site.
      </p>
      <SortableList path={config.path} resourceKey={key} initial={items} />
    </div>
  );
}

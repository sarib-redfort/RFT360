import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResource } from '@/lib/admin-resources';
import { adminGet } from '@/lib/admin-api';
import { ResourceForm } from '@/components/admin/form/resource-form';
import { StatusBadge } from '@/components/admin/status-badge';

/** Edit an existing resource record. */
export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ resource: string; id: string }>;
}) {
  const { resource: key, id } = await params;
  // "new" and "reorder" are handled by sibling routes; guard against them here.
  if (id === 'new' || id === 'reorder') notFound();

  const config = getResource(key);
  if (!config) notFound();

  const record = await adminGet<Record<string, unknown>>(`/admin/${config.path}/${id}`).catch(
    () => null,
  );
  if (!record) notFound();

  return (
    <div>
      <Link href={`/admin/${key}`} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        ← {config.label}
      </Link>
      <div className="mb-6 mt-2 flex items-center gap-3">
        <h1 className="font-[var(--font-heading)] text-2xl font-bold">Edit {config.labelSingular}</h1>
        {config.publishable && record.status ? <StatusBadge status={String(record.status)} /> : null}
      </div>
      <ResourceForm config={config} resourceKey={key} record={record} />
    </div>
  );
}

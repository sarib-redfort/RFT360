import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getResource } from '@/lib/admin-resources';
import { ResourceForm } from '@/components/admin/form/resource-form';

/** Create a new resource record. */
export default async function NewResourcePage({
  params,
}: {
  params: Promise<{ resource: string }>;
}) {
  const { resource: key } = await params;
  const config = getResource(key);
  if (!config) notFound();

  return (
    <div>
      <Link href={`/admin/${key}`} className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        ← {config.label}
      </Link>
      <h1 className="mb-6 mt-2 font-[var(--font-heading)] text-2xl font-bold">
        New {config.labelSingular}
      </h1>
      <ResourceForm config={config} resourceKey={key} />
    </div>
  );
}

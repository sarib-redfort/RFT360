import Link from 'next/link';
import { notFound } from 'next/navigation';
import { adminGet } from '@/lib/admin-api';
import { PageEditor } from './page-editor';

/** Edit a single page's hero copy, body and SEO. */
export default async function EditPageRoute({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const record = await adminGet<Record<string, unknown>>(`/admin/pages/${id}`).catch(() => null);
  if (!record) notFound();

  return (
    <div>
      <Link href="/admin/pages" className="text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
        ← Pages
      </Link>
      <h1 className="mb-6 mt-2 font-[var(--font-heading)] text-2xl font-bold">
        Edit “{String(record.title)}”
      </h1>
      <PageEditor record={record} />
    </div>
  );
}

import { adminGet } from '@/lib/admin-api';
import { HomepageManager } from './homepage-manager';
import type { PaginatedResult } from '@rft360/shared';

interface Section {
  id: string;
  type: string;
  name: string;
  eyebrow?: string | null;
  heading?: string | null;
  headingAccent?: string | null;
  subheading?: string | null;
  itemLimit: number;
  isVisible: boolean;
  order: number;
}

/** Homepage sections manager — order, visibility and copy. */
export default async function HomepageAdminPage() {
  const result = await adminGet<PaginatedResult<Section>>('/admin/homepage-sections', {
    limit: 50,
    sortBy: 'order',
    sortOrder: 'asc',
  }).catch(() => ({ data: [] as Section[], meta: null }));

  const sections = [...(result.data ?? [])].sort((a, b) => a.order - b.order);

  return (
    <div>
      <h1 className="font-[var(--font-heading)] text-2xl font-bold">Homepage</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--text-secondary)]">
        Drag to reorder sections, toggle visibility, and edit each section’s copy. Section order
        follows the planner flow by default.
      </p>
      {sections.length > 0 ? (
        <HomepageManager initial={sections} />
      ) : (
        <p className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-6 py-16 text-center text-sm text-[var(--text-muted)]">
          No homepage sections found. Run the database seed to create the default flow.
        </p>
      )}
    </div>
  );
}

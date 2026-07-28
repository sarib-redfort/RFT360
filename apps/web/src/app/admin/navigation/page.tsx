import { adminGet } from '@/lib/admin-api';
import { NavigationManager } from './navigation-manager';

interface NavItem {
  id: string;
  label: string;
  href?: string | null;
  location: string;
  order: number;
}

/** Navigation builder page. */
export default async function NavigationPage() {
  const items = await adminGet<NavItem[]>('/admin/navigation').catch(() => [] as NavItem[]);

  return (
    <div>
      <h1 className="font-[var(--font-heading)] text-2xl font-bold">Navigation</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--text-secondary)]">
        Manage the header and footer menus. Edit a field and click away to save.
      </p>
      <NavigationManager initial={items} />
    </div>
  );
}

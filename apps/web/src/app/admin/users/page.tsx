import { adminGet } from '@/lib/admin-api';
import { auth } from '@/lib/auth';
import { UsersManager } from './users-manager';
import type { PaginatedResult } from '@rft360/shared';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
}

/** User management page (ADMIN+). */
export default async function UsersPage() {
  const [result, session] = await Promise.all([
    adminGet<PaginatedResult<User>>('/admin/users', { limit: 100 }).catch(() => ({
      data: [] as User[],
      meta: null,
    })),
    auth(),
  ]);

  return (
    <div>
      <h1 className="font-[var(--font-heading)] text-2xl font-bold">Users</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--text-secondary)]">
        Manage CMS accounts and roles. You can’t change your own role or delete yourself.
      </p>
      <UsersManager initial={result.data ?? []} currentUserId={session?.user.id ?? ''} />
    </div>
  );
}

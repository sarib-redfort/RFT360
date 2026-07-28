'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Role } from '@rft360/shared';
import { saveUser, deleteUser, resetUserPassword } from '@/app/admin/actions';
import { formatDate } from '@/lib/utils';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  isActive: boolean;
  lastLoginAt?: string | null;
}

const ROLES = [Role.SUPER_ADMIN, Role.ADMIN, Role.EDITOR, Role.VIEWER];

/** CMS user management: list, invite, change role, reset password, deactivate. */
export function UsersManager({ initial, currentUserId }: { initial: User[]; currentUserId: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: '', email: '', password: '', role: Role.EDITOR as string });

  const input = 'rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm';

  const create = () =>
    startTransition(async () => {
      const result = await saveUser(null, draft);
      if (result.ok) {
        toast.success('User created');
        setDraft({ name: '', email: '', password: '', role: Role.EDITOR });
        setCreating(false);
        router.refresh();
      } else toast.error(result.error);
    });

  const changeRole = (id: string, role: string) =>
    startTransition(async () => {
      const result = await saveUser(id, { role });
      if (result.ok) toast.success('Role updated');
      else toast.error(result.error);
    });

  const toggleActive = (user: User) =>
    startTransition(async () => {
      const result = await saveUser(user.id, { isActive: !user.isActive });
      if (result.ok) {
        toast.success(user.isActive ? 'Deactivated' : 'Activated');
        router.refresh();
      } else toast.error(result.error);
    });

  const reset = (id: string) =>
    startTransition(async () => {
      const pw = prompt('New password (min 10 chars, mixed case + number):');
      if (!pw) return;
      const result = await resetUserPassword(id, pw);
      if (result.ok) toast.success('Password reset');
      else toast.error(result.error);
    });

  const remove = (id: string) =>
    startTransition(async () => {
      if (!confirm('Delete this user?')) return;
      const result = await deleteUser(id);
      if (result.ok) {
        toast.success('Deleted');
        router.refresh();
      } else toast.error(result.error);
    });

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          type="button"
          onClick={() => setCreating((v) => !v)}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white"
        >
          {creating ? 'Cancel' : '+ New user'}
        </button>
      </div>

      {creating && (
        <div className="mb-6 flex flex-wrap items-end gap-2 rounded-2xl border border-dashed border-[var(--border)] p-4">
          <input className={input} placeholder="Name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
          <input className={input} placeholder="Email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
          <input className={input} type="password" placeholder="Password" value={draft.password} onChange={(e) => setDraft({ ...draft, password: e.target.value })} />
          <select className={input} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })}>
            {ROLES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <button type="button" onClick={create} disabled={pending} className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">
            Create
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--text-muted)]">
              <th className="px-5 py-3">User</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3">Last login</th>
              <th className="px-5 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border)]">
            {initial.map((user) => (
              <tr key={user.id} className={user.isActive ? '' : 'opacity-50'}>
                <td className="px-5 py-3">
                  <p className="font-medium text-[var(--text-primary)]">
                    {user.name} {user.id === currentUserId && <span className="text-xs text-[var(--text-muted)]">(you)</span>}
                  </p>
                  <p className="text-xs text-[var(--text-muted)]">{user.email}</p>
                </td>
                <td className="px-5 py-3">
                  <select
                    className="rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-2 py-1 text-sm"
                    defaultValue={user.role}
                    disabled={user.id === currentUserId}
                    onChange={(e) => changeRole(user.id, e.target.value)}
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3 text-[var(--text-muted)]">
                  {user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never'}
                </td>
                <td className="px-5 py-3 text-right">
                  <button type="button" onClick={() => reset(user.id)} className="mr-2 text-xs font-semibold text-[var(--accent)]">
                    Reset password
                  </button>
                  {user.id !== currentUserId && (
                    <>
                      <button type="button" onClick={() => toggleActive(user)} className="mr-2 text-xs text-[var(--text-secondary)]">
                        {user.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                      <button type="button" onClick={() => remove(user.id)} className="text-xs text-red-600">
                        Delete
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

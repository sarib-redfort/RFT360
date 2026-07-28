'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

/** CMS top bar: view-site link, user menu and sign-out. */
export function AdminTopbar({
  user,
}: {
  user: { name: string; email: string; role: string };
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg-card)] px-4 pl-16 md:px-8 lg:pl-8">
      <a
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="hidden items-center gap-2 text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)] sm:flex"
      >
        <i className="fa-solid fa-up-right-from-square text-xs" aria-hidden />
        View site
      </a>

      <div className="relative ml-auto">
        <button
          type="button"
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-3 rounded-lg px-2 py-1.5 hover:bg-[var(--bg-card-hover)]"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-sm font-bold text-[var(--accent)]">
            {user.name.charAt(0).toUpperCase()}
          </span>
          <span className="hidden text-left sm:block">
            <span className="block text-sm font-semibold text-[var(--text-primary)]">{user.name}</span>
            <span className="block text-xs text-[var(--text-muted)]">{user.role}</span>
          </span>
          <i className="fa-solid fa-chevron-down text-xs text-[var(--text-muted)]" aria-hidden />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-56 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-2 shadow-lg">
            <div className="border-b border-[var(--border)] px-3 py-2">
              <p className="text-sm font-semibold text-[var(--text-primary)]">{user.name}</p>
              <p className="truncate text-xs text-[var(--text-muted)]">{user.email}</p>
            </div>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--accent)]"
            >
              <i className="fa-solid fa-right-from-bracket text-xs" aria-hidden />
              Sign out
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

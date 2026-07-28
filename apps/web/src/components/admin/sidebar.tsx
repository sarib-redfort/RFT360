'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { RESOURCES, RESOURCE_GROUPS } from '@/lib/admin-resources';
import { ROLE_RANK, Role } from '@rft360/shared';
import { cn } from '@/lib/utils';

interface NavLink {
  href: string;
  label: string;
  icon: string;
  minRole?: Role;
}

/** Fixed links that aren't config-driven resources. */
const TOP_LINKS: NavLink[] = [
  { href: '/admin', label: 'Dashboard', icon: 'fa-solid fa-gauge-high' },
  { href: '/admin/homepage', label: 'Homepage', icon: 'fa-solid fa-house' },
  { href: '/admin/pages', label: 'Pages', icon: 'fa-solid fa-file-lines' },
  { href: '/admin/media', label: 'Media', icon: 'fa-solid fa-photo-film' },
];

const INBOX_LINKS: NavLink[] = [
  { href: '/admin/submissions', label: 'Messages', icon: 'fa-solid fa-inbox' },
  { href: '/admin/applications', label: 'Applications', icon: 'fa-solid fa-file-arrow-up' },
];

const STRUCTURE_LINKS: NavLink[] = [
  { href: '/admin/gallery', label: 'Gallery', icon: 'fa-solid fa-images' },
  { href: '/admin/navigation', label: 'Navigation', icon: 'fa-solid fa-bars', minRole: Role.EDITOR },
  { href: '/admin/settings', label: 'Settings', icon: 'fa-solid fa-gear', minRole: Role.ADMIN },
  { href: '/admin/users', label: 'Users', icon: 'fa-solid fa-users-gear', minRole: Role.ADMIN },
];

/** CMS left navigation, grouped by area and filtered by the user's role. */
export function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const rank = ROLE_RANK[role as Role] ?? 0;
  const allowed = (link: NavLink) => !link.minRole || rank >= ROLE_RANK[link.minRole];

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const Item = ({ link }: { link: NavLink }) => (
    <Link
      href={link.href}
      onClick={() => setOpen(false)}
      className={cn(
        'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
        isActive(link.href)
          ? 'bg-[var(--accent-subtle)] text-[var(--accent)]'
          : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]',
      )}
    >
      <i className={`${link.icon} w-4 text-center`} aria-hidden />
      {link.label}
    </Link>
  );

  const GroupLabel = ({ children }: { children: string }) => (
    <p className="px-3 pb-1 pt-4 text-[0.65rem] font-bold uppercase tracking-wider text-[var(--text-muted)]">
      {children}
    </p>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="fixed left-4 top-4 z-40 flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--bg-card)] lg:hidden"
      >
        <i className="fa-solid fa-bars" aria-hidden />
      </button>

      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 overflow-y-auto border-r border-[var(--border)] bg-[var(--bg-card)] px-3 py-4 transition-transform lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex items-center gap-2 px-3 pb-2">
          <span className="font-[var(--font-heading)] text-lg font-extrabold text-[var(--text-primary)]">
            RFT360 <span className="text-[var(--accent)]">CMS</span>
          </span>
        </div>

        <nav className="space-y-0.5">
          {TOP_LINKS.map((link) => (
            <Item key={link.href} link={link} />
          ))}

          <GroupLabel>Inbox</GroupLabel>
          {INBOX_LINKS.filter(allowed).map((link) => (
            <Item key={link.href} link={link} />
          ))}

          {RESOURCE_GROUPS.filter((g) => g !== 'Structure').map((group) => {
            const items = RESOURCES.filter((r) => r.group === group);
            if (items.length === 0) return null;
            return (
              <div key={group}>
                <GroupLabel>{group}</GroupLabel>
                {items.map((r) => (
                  <Item
                    key={r.key}
                    link={{ href: `/admin/${r.key}`, label: r.label, icon: r.icon }}
                  />
                ))}
              </div>
            );
          })}

          <GroupLabel>Structure</GroupLabel>
          {STRUCTURE_LINKS.filter(allowed).map((link) => (
            <Item key={link.href} link={link} />
          ))}
        </nav>
      </aside>
    </>
  );
}

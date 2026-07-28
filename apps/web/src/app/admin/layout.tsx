import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Toaster } from 'sonner';
import { auth } from '@/lib/auth';
import { AdminSidebar } from '@/components/admin/sidebar';
import { AdminTopbar } from '@/components/admin/topbar';

export const metadata: Metadata = {
  title: 'CMS',
  robots: { index: false, follow: false },
};

/**
 * CMS shell. Server-side auth gate (belt-and-braces with `middleware.ts`), then
 * the sidebar + topbar chrome. Forced to the light theme for a focused,
 * document-editing feel regardless of the visitor's public-site preference.
 */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect('/login?callbackUrl=/admin');

  return (
    <div data-theme="light" className="min-h-screen bg-[var(--bg-surface)] text-[var(--text-primary)]">
      <AdminSidebar role={session.user.role} />
      <div className="lg:pl-64">
        <AdminTopbar user={{ name: session.user.name ?? 'User', email: session.user.email ?? '', role: session.user.role }} />
        <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</main>
      </div>
      <Toaster position="top-right" richColors />
    </div>
  );
}

import Link from 'next/link';
import { adminGet } from '@/lib/admin-api';
import { formatDate } from '@/lib/utils';

interface Stats {
  posts: { published: number; draft: number };
  jobs: { open: number; newApplications: number };
  submissions: { new: number };
  events: { upcoming: number };
  team: number;
  media: number;
}

interface Activity {
  recentApplications: { id: string; firstName: string; lastName: string; createdAt: string; job?: { title: string } }[];
  recentSubmissions: { id: string; firstName: string; lastName: string; subject?: string; createdAt: string }[];
  recentPosts: { id: string; title: string; slug: string; status: string; updatedAt: string }[];
}

/** CMS home — headline counts and recent activity. */
export default async function DashboardPage() {
  const [stats, activity] = await Promise.all([
    adminGet<Stats>('/admin/dashboard/stats').catch(() => null),
    adminGet<Activity>('/admin/dashboard/activity').catch(() => null),
  ]);

  const cards = [
    { label: 'Published posts', value: stats?.posts.published ?? 0, icon: 'fa-solid fa-newspaper', href: '/admin/posts' },
    { label: 'Draft posts', value: stats?.posts.draft ?? 0, icon: 'fa-solid fa-pen', href: '/admin/posts' },
    { label: 'Open roles', value: stats?.jobs.open ?? 0, icon: 'fa-solid fa-briefcase', href: '/admin/jobs' },
    { label: 'New applications', value: stats?.jobs.newApplications ?? 0, icon: 'fa-solid fa-file-arrow-up', href: '/admin/applications', accent: true },
    { label: 'New messages', value: stats?.submissions.new ?? 0, icon: 'fa-solid fa-inbox', href: '/admin/submissions', accent: true },
    { label: 'Upcoming events', value: stats?.events.upcoming ?? 0, icon: 'fa-solid fa-calendar', href: '/admin/events' },
  ];

  return (
    <div>
      <h1 className="font-[var(--font-heading)] text-2xl font-bold">Dashboard</h1>
      <p className="mt-1 text-sm text-[var(--text-secondary)]">Welcome back — here’s what’s happening.</p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.label}
            href={card.href}
            className="group rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all hover:border-[var(--border-accent)]"
          >
            <div className="flex items-center justify-between">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                  card.accent ? 'bg-[var(--accent)] text-white' : 'bg-[var(--accent-subtle)] text-[var(--accent)]'
                }`}
              >
                <i className={card.icon} aria-hidden />
              </span>
              <span className="text-3xl font-extrabold text-[var(--text-primary)]">{card.value}</span>
            </div>
            <p className="mt-3 text-sm font-medium text-[var(--text-secondary)]">{card.label}</p>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <ActivityCard title="Recent applications" href="/admin/applications">
          {activity?.recentApplications.length ? (
            activity.recentApplications.map((a) => (
              <Row
                key={a.id}
                primary={`${a.firstName} ${a.lastName}`}
                secondary={a.job?.title ?? '—'}
                meta={formatDate(a.createdAt)}
              />
            ))
          ) : (
            <Empty />
          )}
        </ActivityCard>

        <ActivityCard title="Recent messages" href="/admin/submissions">
          {activity?.recentSubmissions.length ? (
            activity.recentSubmissions.map((s) => (
              <Row
                key={s.id}
                primary={`${s.firstName} ${s.lastName}`}
                secondary={s.subject ?? 'Contact enquiry'}
                meta={formatDate(s.createdAt)}
              />
            ))
          ) : (
            <Empty />
          )}
        </ActivityCard>
      </div>
    </div>
  );
}

function ActivityCard({ title, href, children }: { title: string; href: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-4">
        <h2 className="font-semibold text-[var(--text-primary)]">{title}</h2>
        <Link href={href} className="text-xs font-semibold text-[var(--accent)]">
          View all
        </Link>
      </div>
      <div className="divide-y divide-[var(--border)]">{children}</div>
    </div>
  );
}

function Row({ primary, secondary, meta }: { primary: string; secondary: string; meta: string }) {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div>
        <p className="text-sm font-medium text-[var(--text-primary)]">{primary}</p>
        <p className="text-xs text-[var(--text-muted)]">{secondary}</p>
      </div>
      <span className="text-xs text-[var(--text-muted)]">{meta}</span>
    </div>
  );
}

function Empty() {
  return <p className="px-5 py-6 text-center text-sm text-[var(--text-muted)]">Nothing yet.</p>;
}

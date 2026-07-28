import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Container, Icon } from '@/components/ui/primitives';
import { GlowOrb } from '@/components/ui/primitives';
import { ApplicationForm } from '@/components/forms/application-form';
import { JobPostingJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { getJob } from '@/lib/content';
import { formatSalaryRange, humanizeEnum } from '@rft360/shared';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) return { title: 'Role not found' };
  return {
    title: job.title,
    description: job.summary ?? `Apply for ${job.title} at RedFort.`,
    alternates: { canonical: `/careers/${slug}` },
  };
}

/** Job detail — full description, meta and the application form. */
export default async function JobDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const job = await getJob(slug);
  if (!job) notFound();

  const salary =
    !job.hideSalary && job.salaryMin
      ? formatSalaryRange(job.salaryMin, job.salaryMax, job.salaryCurrency)
      : null;

  const meta = [
    { icon: 'fa-solid fa-location-dot', value: job.location },
    { icon: 'fa-solid fa-briefcase', value: humanizeEnum(job.employmentType) },
    { icon: 'fa-solid fa-house-laptop', value: humanizeEnum(job.workMode) },
    { icon: 'fa-solid fa-signal', value: humanizeEnum(job.experienceLevel) },
    salary ? { icon: 'fa-solid fa-money-bill', value: salary } : null,
  ].filter(Boolean) as { icon: string; value: string }[];

  const lists: [string, string[] | undefined][] = [
    ['Responsibilities', job.responsibilities],
    ['Requirements', job.requirements],
    ['Nice to have', job.niceToHave],
    ['Benefits', job.benefits],
  ];

  return (
    <>
      <JobPostingJsonLd job={job} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Careers', url: '/careers' },
          { name: job.title, url: `/careers/${slug}` },
        ]}
      />

      <section className="relative overflow-hidden bg-[var(--bg-dark)] pt-36 pb-14 md:pt-44">
        <GlowOrb className="h-[500px] w-[600px]" style={{ top: -120, right: -140 }} />
        <Container className="relative z-10">
          <Link href="/careers" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
            ← All roles
          </Link>
          {job.department && (
            <span className="mt-4 block text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
              {job.department.name}
            </span>
          )}
          <h1 className="display-md mt-2 max-w-3xl">{job.title}</h1>
          <div className="mt-6 flex flex-wrap gap-3">
            {meta.map((m) => (
              <span
                key={m.value}
                className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-4 py-2 text-sm text-[var(--text-secondary)]"
              >
                <Icon name={m.icon} className="text-[var(--accent)]" />
                {m.value}
              </span>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-[var(--bg-dark)] pb-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
            <div>
              {job.descriptionHtml && (
                <div
                  className="prose-rft"
                  dangerouslySetInnerHTML={{ __html: job.descriptionHtml }}
                />
              )}
              {lists.map(([title, items]) =>
                items && items.length > 0 ? (
                  <div key={title} className="mt-10">
                    <h2 className="font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">
                      {title}
                    </h2>
                    <ul className="mt-4 space-y-2">
                      {items.map((item) => (
                        <li key={item} className="flex items-start gap-3 text-[var(--text-secondary)]">
                          <Icon name="fa-solid fa-circle-check" className="mt-1 text-[var(--accent)]" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null,
              )}
              {job.skills && job.skills.length > 0 && (
                <div className="mt-10 flex flex-wrap gap-2">
                  {job.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="lg:sticky lg:top-28 lg:self-start">
              <ApplicationForm jobId={job.id} jobTitle={job.title} />
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

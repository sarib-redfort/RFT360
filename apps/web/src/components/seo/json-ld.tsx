import { SITE_URL } from '@/lib/utils';
import type { JobItem, PostItem } from '@/lib/content-types';
import { formatSalaryRange, humanizeEnum } from '@rft360/shared';

/** Renders a JSON-LD script tag from an arbitrary schema.org object. */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return (
    <script
      type="application/ld+json"
      // JSON.stringify output is safe to inline; no user HTML is interpolated.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

/** Organization schema — emitted once on the homepage. */
export function OrganizationJsonLd() {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: 'RFT360',
        alternateName: 'RFT 360',
        url: SITE_URL,
        logo: `${SITE_URL}/brand/logo-on-light.png`,
        description:
          'RFT360 is where we share our culture, our people and the careers we build together.',
        address: { '@type': 'PostalAddress', addressCountry: 'PK', addressLocality: 'Lahore' },
      }}
    />
  );
}

/** BlogPosting schema for an article detail page. */
export function BlogPostingJsonLd({ post }: { post: PostItem }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: post.title,
        description: post.excerpt ?? undefined,
        datePublished: post.publishedAt ?? undefined,
        author: post.author ? { '@type': 'Person', name: post.author.name } : undefined,
        publisher: { '@type': 'Organization', name: 'RFT360' },
        mainEntityOfPage: `${SITE_URL}/blogs/${post.slug}`,
      }}
    />
  );
}

/** JobPosting schema for a careers detail page (Google Jobs eligible). */
export function JobPostingJsonLd({ job }: { job: JobItem }) {
  const salary =
    !job.hideSalary && job.salaryMin
      ? {
          '@type': 'MonetaryAmount',
          currency: job.salaryCurrency ?? 'PKR',
          value: {
            '@type': 'QuantitativeValue',
            minValue: job.salaryMin,
            maxValue: job.salaryMax ?? undefined,
            unitText: 'MONTH',
          },
        }
      : undefined;

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'JobPosting',
        title: job.title,
        description: job.descriptionHtml || job.summary || job.title,
        datePosted: job.createdAt,
        validThrough: job.applicationDeadline ?? undefined,
        employmentType: humanizeEnum(job.employmentType).toUpperCase().replace(' ', '_'),
        hiringOrganization: {
          '@type': 'Organization',
          name: 'RFT360',
          sameAs: SITE_URL,
        },
        jobLocation: {
          '@type': 'Place',
          address: { '@type': 'PostalAddress', addressLocality: job.location, addressCountry: 'PK' },
        },
        baseSalary: salary,
      }}
    />
  );
}

/** FAQPage schema for pages that show an FAQ block. */
export function FaqJsonLd({ items }: { items: { question: string; answer: string }[] }) {
  if (items.length === 0) return null;
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: items.map((item) => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: { '@type': 'Answer', text: item.answer },
        })),
      }}
    />
  );
}

/** BreadcrumbList schema. */
export function BreadcrumbJsonLd({ items }: { items: { name: string; url: string }[] }) {
  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          name: item.name,
          item: `${SITE_URL}${item.url}`,
        })),
      }}
    />
  );
}

export { formatSalaryRange };

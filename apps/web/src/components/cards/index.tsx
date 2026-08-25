import Image from 'next/image';
import Link from 'next/link';
import { formatDate, mediaSrc } from '@/lib/utils';
import { Icon, IconTile } from '@/components/ui/primitives';
import type {
  CaseStudyItem,
  IndustryItem,
  JobItem,
  PerkItem,
  PostItem,
  ServiceItem,
  TeamMemberItem,
  TestimonialItem,
  ValueItem,
} from '@/lib/content-types';
import { humanizeEnum } from '@rft360/shared';

/*
 * Card vocabulary, ported 1:1 from the original stylesheet.
 *
 * Most cards are CELLS inside a `.hairline-grid` — the original's signature
 * treatment where a grid uses `gap:1px` over a border-coloured background, so
 * cells read as one slab divided by hairlines rather than as floating cards.
 * Cells do NOT lift on hover; they shift background and reveal a 2px red top
 * sweep (`.grid-cell`). Standalone `.card` (which does lift) is used only where
 * the original used it.
 */

/** Services grid cell — ports `.svc-card`. */
export function ServiceCard({ service, index }: { service: ServiceItem; index?: number }) {
  return (
    <div className="grid-cell px-7 py-8">
      {index != null && (
        <div className="svc-num mb-5">{String(index + 1).padStart(2, '0')}</div>
      )}
      <IconTile icon={service.icon} small className="mb-4" />
      <h3 className="mb-2 text-[0.95rem] font-bold text-[var(--text-primary)]">{service.title}</h3>
      {service.shortDescription && (
        <p className="text-[0.825rem] leading-[1.65] text-[var(--text-secondary)]">
          {service.shortDescription}
        </p>
      )}
      {service.features && service.features.length > 0 && <ServiceFeatures items={service.features} />}
    </div>
  );
}

/**
 * The technology line under a discipline ("Work with: AWS • Azure • …").
 *
 * By convention the first entry is a LABEL when it ends in a colon, because the
 * source copy varies it per discipline ("Work with:" vs "Focus on:"). Keeping
 * that in the data avoids a schema column for what is really one word of copy.
 */
function ServiceFeatures({ items }: { items: string[] }) {
  const hasLabel = items[0]?.trimEnd().endsWith(':');
  const label = hasLabel ? items[0] : 'Work with:';
  const values = hasLabel ? items.slice(1) : items;
  if (values.length === 0) return null;

  return (
    <p className="mt-4 text-[0.75rem] leading-[1.7] text-[var(--text-muted)]">
      <span className="font-semibold text-[var(--text-secondary)]">{label} </span>
      {values.map((v, i) => (
        <span key={v}>
          {i > 0 && <span className="mx-1.5 text-[var(--border-accent)]">•</span>}
          {v}
        </span>
      ))}
    </p>
  );
}

/** Industries grid cell — ports `.ind-card`. */
export function IndustryTile({ industry }: { industry: IndustryItem }) {
  return (
    <div className="ind-cell">
      <div className="ind-icon">
        <Icon name={industry.icon} />
      </div>
      <span>{industry.name}</span>
      {/* Each industry carries a line explaining what we build for it; without
          this the tile is just a logo wall and that copy never reaches the page. */}
      {industry.description && (
        <p className="ind-desc">{industry.description}</p>
      )}
    </div>
  );
}

/** Values / perks grid cell — ports `.val-card`. */
export function FeatureCard({ item }: { item: PerkItem | ValueItem }) {
  return (
    <div className="grid-cell px-8 py-10">
      <IconTile icon={item.icon} className="mb-5" />
      <h3 className="mb-2.5 text-base font-bold text-[var(--text-primary)]">{item.title}</h3>
      <p className="text-[0.875rem] leading-[1.7] text-[var(--text-secondary)]">
        {item.description}
      </p>
    </div>
  );
}

/** Team grid cell — ports `.team-card`. */
export function TeamCard({ member }: { member: TeamMemberItem }) {
  const photo = mediaSrc(member.photo, 'medium');
  return (
    <div className="grid-cell px-6 py-8">
      <span className="mb-5 flex h-[60px] w-[60px] items-center justify-center overflow-hidden rounded-full border border-[rgba(222,24,27,0.12)] bg-[rgba(222,24,27,0.06)] text-[1.3rem] text-[var(--accent)]">
        {photo ? (
          <Image
            src={photo}
            alt={member.name}
            width={60}
            height={60}
            className="h-full w-full object-cover"
          />
        ) : (
          <Icon name="fa-solid fa-user" />
        )}
      </span>
      <div className="mb-1 text-[0.95rem] font-bold text-[var(--text-primary)]">{member.name}</div>
      <div className="text-[0.78rem] text-[var(--text-secondary)]">{member.role}</div>
      {member.bio && (
        <p className="mt-3 text-[0.8rem] leading-[1.65] text-[var(--text-secondary)]">
          {member.bio}
        </p>
      )}
    </div>
  );
}

/** Testimonial grid cell. */
export function TestimonialCard({ testimonial }: { testimonial: TestimonialItem }) {
  const avatar = mediaSrc(testimonial.avatar, 'thumbnail');
  return (
    <figure className="grid-cell flex h-full flex-col px-8 py-9">
      <Icon name="fa-solid fa-quote-left" className="text-xl text-[var(--accent)]" />
      <blockquote className="mt-4 flex-1 text-[0.925rem] leading-[1.75] text-[var(--text-primary)]">
        “{testimonial.quote}”
      </blockquote>
      <figcaption className="mt-6 flex items-center gap-3">
        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[rgba(222,24,27,0.12)] bg-[rgba(222,24,27,0.06)] text-[var(--accent)]">
          {avatar ? (
            <Image
              src={avatar}
              alt={testimonial.authorName}
              width={44}
              height={44}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-sm font-bold">{testimonial.authorName.charAt(0)}</span>
          )}
        </span>
        <span>
          <span className="block text-[0.875rem] font-bold text-[var(--text-primary)]">
            {testimonial.authorName}
          </span>
          {testimonial.authorRole && (
            <span className="block text-[0.75rem] text-[var(--text-muted)]">
              {testimonial.authorRole}
            </span>
          )}
        </span>
      </figcaption>
    </figure>
  );
}

/** Blog card — standalone `.card` (lifts on hover), as in the original. */
export function PostCard({ post }: { post: PostItem }) {
  const cover = mediaSrc(post.coverImage, 'medium');
  return (
    <Link href={`/blogs/${post.slug}`} className="card flex h-full flex-col !p-0">
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-surface)]">
        {cover ? (
          <Image
            src={cover}
            alt={post.coverImage?.alt ?? post.title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
            <Icon name="fa-regular fa-image" className="text-3xl" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        {post.category && (
          <span className="text-[0.68rem] font-bold uppercase tracking-[2px] text-[var(--accent)]">
            {post.category.name}
          </span>
        )}
        <h3 className="mt-2 text-base font-bold leading-snug text-[var(--text-primary)]">
          {post.title}
        </h3>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 flex-1 text-[0.875rem] leading-[1.7] text-[var(--text-secondary)]">
            {post.excerpt}
          </p>
        )}
        <div className="mt-4 flex items-center gap-2 text-[0.72rem] text-[var(--text-muted)]">
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          {post.readingMinutes && <span>· {post.readingMinutes} min read</span>}
        </div>
      </div>
    </Link>
  );
}

/** Case study / success story — standalone `.card`. */
export function CaseStudyCard({ caseStudy }: { caseStudy: CaseStudyItem }) {
  const cover = mediaSrc(caseStudy.coverImage, 'medium');
  return (
    <div className="card flex h-full flex-col !p-0">
      {cover && (
        <div className="relative aspect-[16/9] overflow-hidden bg-[var(--bg-surface)]">
          <Image src={cover} alt={caseStudy.title} fill sizes="33vw" className="object-cover" />
        </div>
      )}
      <div className="flex flex-1 flex-col p-7">
        {caseStudy.clientName && (
          <span className="text-[0.68rem] font-bold uppercase tracking-[2px] text-[var(--accent)]">
            {caseStudy.clientName}
          </span>
        )}
        <h3 className="mt-2 text-base font-bold text-[var(--text-primary)]">{caseStudy.title}</h3>
        {caseStudy.summary && (
          <p className="mt-2 line-clamp-3 flex-1 text-[0.875rem] leading-[1.7] text-[var(--text-secondary)]">
            {caseStudy.summary}
          </p>
        )}
        {caseStudy.results && caseStudy.results.length > 0 && (
          <div className="mt-6 flex gap-6 border-t border-[var(--border)] pt-4">
            {caseStudy.results.slice(0, 3).map((r) => (
              <div key={r.label}>
                <div className="text-xl font-black tracking-[-1px] text-[var(--text-primary)]">
                  {r.value}
                </div>
                <div className="mt-0.5 text-[0.62rem] font-semibold uppercase tracking-[1.5px] text-[var(--text-muted)]">
                  {r.label}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/** Job row — ports `.job-card` (slides right on hover). */
export function JobCard({ job }: { job: JobItem }) {
  return (
    <Link href={`/careers/${job.slug}`} className="job-card group flex-col items-start sm:flex-row sm:items-center">
      <div>
        <div className="mb-1.5 text-base font-bold text-[var(--text-primary)]">{job.title}</div>
        <div className="flex flex-wrap gap-3">
          {[job.location, humanizeEnum(job.employmentType), humanizeEnum(job.workMode)].map(
            (tag) => (
              <span className="job-tag" key={tag}>
                {tag}
              </span>
            ),
          )}
        </div>
      </div>
      <span className="btn-primary whitespace-nowrap !px-6 !py-2.5 !text-[0.85rem]">
        View Role
      </span>
    </Link>
  );
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHero } from '@/components/layout/page-hero';
import { Section } from '@/components/ui/section';
import { Reveal } from '@/components/ui/reveal';
import { PostCard } from '@/components/cards';
import { getCategories, getPage, getPosts } from '@/lib/content';
import { metaFromPage } from '@/lib/page-meta';
import type { PostItem } from '@/lib/content-types';
import { cn } from '@/lib/utils';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('blogs');
  return metaFromPage(page, {
    title: 'Blogs',
    description: 'Insights and stories from the RedFort team.',
    path: '/blogs',
  });
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

/** Blog index — category filter, a featured lead post, and the article grid. */
export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; page?: string }>;
}) {
  const { category, page: pageParam } = await searchParams;
  const pageNum = Number(pageParam ?? '1');

  const [page, postsResult, categories] = await Promise.all([
    getPage('blogs'),
    getPosts({
      ...(category ? { category } : {}),
      page: String(pageNum),
      limit: '9',
    }),
    getCategories() as Promise<Category[]>,
  ]);

  const posts = postsResult.data as PostItem[];
  const [featured, ...rest] = pageNum === 1 && !category ? posts : [];
  const gridPosts = pageNum === 1 && !category ? rest : posts;
  const { totalPages } = postsResult.meta;

  return (
    <>
      <PageHero
        eyebrow={page?.eyebrow ?? 'From our team'}
        heading={page?.heading ?? 'Insights &'}
        accent={page?.headingAccent}
        subheading={page?.subheading ?? 'Thoughts on technology, culture and careers from the RedFort team.'}
        image={page?.heroImage}
      />

      <Section topRule="accent" glow>
        {categories.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2">
            <Chip href="/blogs" active={!category} label="All" />
            {categories.map((cat) => (
              <Chip
                key={cat.id}
                href={`/blogs?category=${cat.slug}`}
                active={category === cat.slug}
                label={cat.name}
              />
            ))}
          </div>
        )}

        {featured && (
          <Reveal className="mb-10">
            <FeaturedPost post={featured} />
          </Reveal>
        )}

        {gridPosts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {gridPosts.map((post, i) => (
              <Reveal key={post.id} delay={(i % 3) * 0.08}>
                <PostCard post={post} />
              </Reveal>
            ))}
          </div>
        ) : (
          !featured && (
            <p className="text-center text-[var(--text-secondary)]">No articles here yet.</p>
          )
        )}

        {totalPages > 1 && (
          <div className="mt-12 flex justify-center gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link
                key={n}
                href={`/blogs?${category ? `category=${category}&` : ''}page=${n}`}
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-lg border text-sm font-semibold',
                  n === pageNum
                    ? 'border-[var(--border-accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
                    : 'border-[var(--border)] text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                )}
              >
                {n}
              </Link>
            ))}
          </div>
        )}
      </Section>
    </>
  );
}

function Chip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        'tap-target inline-flex items-center rounded-full border px-4 py-2 text-sm font-medium transition-colors',
        active
          ? 'border-[var(--border-accent)] bg-[var(--accent-subtle)] text-[var(--accent)]'
          : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-accent)] hover:text-[var(--text-primary)]',
      )}
    >
      {label}
    </Link>
  );
}

import Image from 'next/image';
import { formatDate, mediaSrc } from '@/lib/utils';

function FeaturedPost({ post }: { post: PostItem }) {
  const cover = mediaSrc(post.coverImage, 'large');
  return (
    <Link
      href={`/blogs/${post.slug}`}
      className="group grid overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] transition-all duration-300 hover:border-[var(--border-accent)] md:grid-cols-2"
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-[var(--bg-surface)] md:aspect-auto">
        {cover && (
          <Image src={cover} alt={post.title} fill sizes="50vw" className="object-cover transition-transform duration-500 group-hover:scale-105" />
        )}
      </div>
      <div className="flex flex-col justify-center p-8 md:p-10">
        {post.category && (
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            Featured · {post.category.name}
          </span>
        )}
        <h2 className="mt-3 font-[var(--font-heading)] text-2xl font-bold leading-tight text-[var(--text-primary)] md:text-3xl">
          {post.title}
        </h2>
        {post.excerpt && <p className="mt-3 text-[var(--text-secondary)]">{post.excerpt}</p>}
        <div className="mt-5 flex items-center gap-3 text-xs text-[var(--text-muted)]">
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          {post.readingMinutes && <span>· {post.readingMinutes} min read</span>}
        </div>
      </div>
    </Link>
  );
}

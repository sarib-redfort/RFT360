import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Container, Icon } from '@/components/ui/primitives';
import { Section } from '@/components/ui/section';
import { PostCard } from '@/components/cards';
import { BlogPostingJsonLd, BreadcrumbJsonLd } from '@/components/seo/json-ld';
import { getPost } from '@/lib/content';
import { formatDate, mediaSrc, absoluteUrl } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Article not found' };
  const cover = mediaSrc(post.coverImage, 'large');
  return {
    title: post.title,
    description: post.excerpt ?? undefined,
    alternates: { canonical: `/blogs/${slug}` },
    openGraph: {
      title: post.title,
      description: post.excerpt ?? undefined,
      type: 'article',
      publishedTime: post.publishedAt ?? undefined,
      images: cover ? [{ url: cover }] : undefined,
    },
  };
}

/** Article detail — cover, author byline, sanitised body and related posts. */
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const cover = mediaSrc(post.coverImage, 'large');
  const authorPhoto = mediaSrc(post.author?.photo, 'thumbnail');

  return (
    <article className="bg-[var(--bg-dark)] pb-8 pt-36 md:pt-44">
      <BlogPostingJsonLd post={post} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Blogs', url: '/blogs' },
          { name: post.title, url: `/blogs/${slug}` },
        ]}
      />

      <Container size="narrow">
        <Link href="/blogs" className="text-sm font-medium text-[var(--text-secondary)] hover:text-[var(--text-primary)]">
          ← All articles
        </Link>
        {post.category && (
          <span className="mt-6 block text-xs font-bold uppercase tracking-wider text-[var(--accent)]">
            {post.category.name}
          </span>
        )}
        <h1 className="display-md mt-2">{post.title}</h1>

        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-[var(--text-muted)]">
          {post.author && (
            <span className="inline-flex items-center gap-2">
              {authorPhoto ? (
                <Image src={authorPhoto} alt={post.author.name} width={28} height={28} className="rounded-full" />
              ) : (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-xs text-[var(--accent)]">
                  {post.author.name.charAt(0)}
                </span>
              )}
              <span className="text-[var(--text-secondary)]">{post.author.name}</span>
            </span>
          )}
          {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
          {post.readingMinutes && <span>· {post.readingMinutes} min read</span>}
        </div>
      </Container>

      {cover && (
        <Container size="narrow" className="mt-10">
          <div className="relative aspect-[16/9] overflow-hidden rounded-3xl border border-[var(--border)]">
            <Image src={cover} alt={post.coverImage?.alt ?? post.title} fill sizes="820px" className="object-cover" priority />
          </div>
        </Container>
      )}

      <Container size="narrow" className="mt-12">
        {post.contentHtml && (
          <div className="prose-rft" dangerouslySetInnerHTML={{ __html: post.contentHtml }} />
        )}

        {post.tags && post.tags.length > 0 && (
          <div className="mt-10 flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]"
              >
                #{tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Share */}
        <div className="mt-8 flex items-center gap-3 border-t border-[var(--border)] pt-8">
          <span className="text-sm text-[var(--text-muted)]">Share:</span>
          {[
            { icon: 'fa-brands fa-linkedin-in', href: `https://www.linkedin.com/sharing/share-offsite/?url=${absoluteUrl(`/blogs/${slug}`)}` },
            { icon: 'fa-brands fa-x-twitter', href: `https://twitter.com/intent/tweet?url=${absoluteUrl(`/blogs/${slug}`)}&text=${encodeURIComponent(post.title)}` },
            { icon: 'fa-brands fa-facebook-f', href: `https://www.facebook.com/sharer/sharer.php?u=${absoluteUrl(`/blogs/${slug}`)}` },
          ].map((s) => (
            <a
              key={s.icon}
              href={s.href}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-accent)] hover:text-[var(--accent)]"
            >
              <Icon name={s.icon} />
            </a>
          ))}
        </div>
      </Container>

      {post.related && post.related.length > 0 && (
        <Section topRule="muted" className="mt-16">
          <h2 className="display-md">Related reading</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {post.related.map((related) => (
              <PostCard key={related.id} post={related} />
            ))}
          </div>
        </Section>
      )}
    </article>
  );
}

import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';

/** Global 404. Uses the brand shell without the site chrome dependency. */
export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[var(--bg-dark)] px-6 text-center">
      <span className="font-[var(--font-heading)] text-[6rem] font-extrabold leading-none text-accent-grad">
        404
      </span>
      <h1 className="mt-4 font-[var(--font-heading)] text-2xl font-bold text-[var(--text-primary)]">
        Page not found
      </h1>
      <p className="mt-3 max-w-md text-[var(--text-secondary)]">
        The page you’re looking for doesn’t exist or has moved.
      </p>
      <div className="mt-8 flex gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <Link
          href="/careers"
          className="inline-flex items-center rounded-md border border-[var(--border)] px-6 py-2.5 text-sm font-semibold text-[var(--text-primary)]"
        >
          View careers
        </Link>
      </div>
    </main>
  );
}

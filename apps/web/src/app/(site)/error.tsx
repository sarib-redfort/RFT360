'use client';

import { useEffect } from 'react';
import { Container } from '@/components/ui/primitives';
import { Button, ButtonLink } from '@/components/ui/button';

/**
 * Route-level error boundary for the public site. Keeps a failed page inside
 * the site chrome with a recovery action instead of showing a blank screen.
 */
export default function SiteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Surfaced in the server log / error reporter; never shown to visitors.
    console.error('Page error:', error);
  }, [error]);

  return (
    <section className="flex min-h-[70vh] items-center bg-[var(--bg-dark)]">
      <Container size="narrow" className="text-center">
        <span className="eyebrow">Something went wrong</span>
        <h1 className="display-md mt-3">We hit an unexpected error</h1>
        <p className="body-text mx-auto mt-4">
          The page couldn’t be loaded. Try again, or head back to the homepage.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Button onClick={reset}>Try again</Button>
          <ButtonLink href="/" variant="outline">
            Back home
          </ButtonLink>
        </div>
      </Container>
    </section>
  );
}

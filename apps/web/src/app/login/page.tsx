import { Suspense } from 'react';
import type { Metadata } from 'next';
import { LoginForm } from './login-form';
import { Logo } from '@/components/layout/logo';

export const metadata: Metadata = {
  title: 'Sign in',
  robots: { index: false, follow: false },
};

/** CMS sign-in screen. */
export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--bg-dark)] px-6">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Logo />
        </div>
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-8">
          <h1 className="font-[var(--font-heading)] text-2xl font-bold text-[var(--text-primary)]">
            Sign in
          </h1>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            Access the RFT360 content management system.
          </p>
          <Suspense>
            <LoginForm />
          </Suspense>
        </div>
        <p className="mt-6 text-center text-xs text-[var(--text-muted)]">
          Protected area · RFT360
        </p>
      </div>
    </main>
  );
}

'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { jobApplicationSchema, type JobApplicationInput } from '@rft360/shared';
import { API_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Field, TextInput, Textarea } from './fields';

/**
 * Job application form. Validated with the shared `jobApplicationSchema` (same
 * as the API). Submits multipart/form-data so the optional CV rides along with
 * the fields; shows an inline confirmation on success.
 */
export function ApplicationForm({ jobId, jobTitle }: { jobId: string; jobTitle: string }) {
  const [done, setDone] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<JobApplicationInput>({
    resolver: zodResolver(jobApplicationSchema),
    defaultValues: { jobId, consent: false as never },
  });

  async function onSubmit(values: JobApplicationInput) {
    try {
      const body = new FormData();
      Object.entries(values).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '') body.append(key, String(val));
      });
      if (file) body.append('resume', file);

      const res = await fetch(`${API_URL}/applications`, { method: 'POST', body });
      if (!res.ok) throw new Error('failed');
      setDone(true);
      reset();
    } catch {
      setError('root', { message: 'Something went wrong submitting your application.' });
    }
  }

  if (done) {
    return (
      <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-card)] p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]">
          <i className="fa-solid fa-check text-xl" aria-hidden />
        </div>
        <h3 className="mt-4 font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">
          Application received
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Thanks for applying to {jobTitle}. Our talent team will be in touch.
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8"
    >
      <input type="hidden" {...register('jobId')} value={jobId} />
      <h3 className="font-[var(--font-heading)] text-lg font-semibold text-[var(--text-primary)]">
        Apply for this role
      </h3>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Field label="First name" error={errors.firstName?.message}>
          <TextInput {...register('firstName')} />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <TextInput {...register('lastName')} />
        </Field>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Email" error={errors.email?.message}>
          <TextInput type="email" {...register('email')} />
        </Field>
        <Field label="Phone" error={errors.phone?.message}>
          <TextInput {...register('phone')} />
        </Field>
      </div>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="LinkedIn (optional)" error={errors.linkedinUrl?.message}>
          <TextInput placeholder="https://linkedin.com/in/…" {...register('linkedinUrl')} />
        </Field>
        <Field label="Years of experience (optional)" error={errors.yearsOfExperience?.message}>
          <TextInput type="number" min={0} {...register('yearsOfExperience')} />
        </Field>
      </div>

      <Field label="Cover letter (optional)" error={errors.coverLetter?.message} className="mt-4">
        <Textarea rows={4} placeholder="Tell us why you’d be a great fit…" {...register('coverLetter')} />
      </Field>

      {/* CV upload */}
      <div className="mt-4">
        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
          CV / Résumé (PDF or Word)
        </label>
        <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg border border-dashed border-[var(--border)] bg-[var(--bg-surface)] px-4 py-3 text-sm text-[var(--text-secondary)] transition-colors hover:border-[var(--border-accent)]">
          <span>{fileName ?? 'Choose a file…'}</span>
          <span className="text-[var(--accent)]">Browse</span>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0] ?? null;
              setFile(f);
              setFileName(f?.name ?? null);
            }}
          />
        </label>
      </div>

      {/* Honeypot */}
      <input type="text" tabIndex={-1} aria-hidden className="hidden" {...register('website')} />

      <label className="mt-4 flex items-start gap-3 text-sm text-[var(--text-secondary)]">
        <input type="checkbox" className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent)]" {...register('consent')} />
        <span>
          I consent to RedFort processing my application data.
          {errors.consent && (
            <span className="mt-1 block text-xs text-[var(--accent)]">{errors.consent.message}</span>
          )}
        </span>
      </label>

      {errors.root && <p className="mt-4 text-sm text-[var(--accent)]">{errors.root.message}</p>}

      <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
        {isSubmitting ? 'Submitting…' : 'Submit application'}
      </Button>
    </form>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { contactFormSchema, type ContactFormInput } from '@rft360/shared';
import { API_URL } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Field, Textarea, TextInput } from './fields';
import { useState } from 'react';

/**
 * Public contact form. Validates with the SAME Zod schema the API uses
 * (`contactFormSchema`), so client and server rules can never drift. Posts to
 * the API's public `/contact` endpoint and shows an inline success state.
 */
export function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: { consent: false as never },
  });

  async function onSubmit(values: ContactFormInput) {
    try {
      const res = await fetch(`${API_URL}/contact`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error('Request failed');
      setSubmitted(true);
      reset();
    } catch {
      setError('root', { message: 'Something went wrong. Please try again.' });
    }
  }

  if (submitted) {
    return (
      <div className="rounded-2xl border border-[var(--border-accent)] bg-[var(--bg-card)] p-10 text-center">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--accent-subtle)] text-[var(--accent)]">
          <i className="fa-solid fa-check text-xl" aria-hidden />
        </div>
        <h3 className="mt-4 font-[var(--font-heading)] text-xl font-semibold text-[var(--text-primary)]">
          Message sent
        </h3>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Thanks for reaching out — we’ll get back to you shortly.
        </p>
        <Button variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          Send another
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="First name" error={errors.firstName?.message}>
          <TextInput placeholder="Ayesha" {...register('firstName')} />
        </Field>
        <Field label="Last name" error={errors.lastName?.message}>
          <TextInput placeholder="Khan" {...register('lastName')} />
        </Field>
      </div>
      <Field label="Email" error={errors.email?.message} className="mt-4">
        <TextInput type="email" placeholder="you@example.com" {...register('email')} />
      </Field>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Field label="Phone (optional)" error={errors.phone?.message}>
          <TextInput placeholder="+92 300 1234567" {...register('phone')} />
        </Field>
        <Field label="Company (optional)" error={errors.company?.message}>
          <TextInput placeholder="Company" {...register('company')} />
        </Field>
      </div>
      <Field label="Subject (optional)" error={errors.subject?.message} className="mt-4">
        <TextInput placeholder="How can we help?" {...register('subject')} />
      </Field>
      <Field label="Message" error={errors.message?.message} className="mt-4">
        <Textarea rows={5} placeholder="Tell us a little about your enquiry…" {...register('message')} />
      </Field>

      {/* Honeypot — hidden from users, catches naive bots. */}
      <input
        type="text"
        tabIndex={-1}
        autoComplete="off"
        aria-hidden="true"
        className="hidden"
        {...register('website')}
      />

      <label className="mt-4 flex items-start gap-3 text-sm text-[var(--text-secondary)]">
        <input
          type="checkbox"
          className="mt-0.5 h-5 w-5 shrink-0 accent-[var(--accent)]"
          {...register('consent')}
        />
        <span>
          I agree to the processing of my details in line with the privacy policy.
          {errors.consent && (
            <span className="mt-1 block text-xs text-[var(--accent)]">{errors.consent.message}</span>
          )}
        </span>
      </label>

      {errors.root && (
        <p className="mt-4 text-sm text-[var(--accent)]">{errors.root.message}</p>
      )}

      <Button type="submit" disabled={isSubmitting} className="mt-6 w-full">
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}

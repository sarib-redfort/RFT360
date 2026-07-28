import { z } from 'zod';
import { emailSchema, idSchema, phoneSchema } from './common';

/**
 * Public-facing form schemas.
 *
 * The same object validates the React form (via `zodResolver`) and the API
 * endpoint (via `nestjs-zod`), so client and server rules can never drift.
 */

/**
 * Hidden field that real users never fill in. Bots that auto-complete every
 * input trip it, and the API silently discards the submission.
 */
const honeypotSchema = z.string().max(0, 'Submission rejected').optional().or(z.literal(''));

export const contactFormSchema = z.object({
  firstName: z.string().trim().min(2, 'First name is required').max(60),
  lastName: z.string().trim().min(1, 'Last name is required').max(60),
  email: emailSchema,
  phone: phoneSchema.optional().or(z.literal('')),
  company: z.string().trim().max(120).optional().or(z.literal('')),
  subject: z.string().trim().max(160).optional().or(z.literal('')),
  message: z
    .string()
    .trim()
    .min(10, 'Please tell us a little more (at least 10 characters)')
    .max(5000, 'Message must be 5000 characters or fewer'),
  /** Explicit consent, required for PDPA/GDPR-style compliance. */
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please accept the privacy policy to continue' }),
  }),
  website: honeypotSchema,
});
export type ContactFormInput = z.infer<typeof contactFormSchema>;

export const jobApplicationSchema = z.object({
  jobId: idSchema,
  firstName: z.string().trim().min(2, 'First name is required').max(60),
  lastName: z.string().trim().min(1, 'Last name is required').max(60),
  email: emailSchema,
  phone: phoneSchema,
  location: z.string().trim().max(120).optional().or(z.literal('')),
  linkedinUrl: z
    .string()
    .trim()
    .url('Enter a valid LinkedIn URL')
    .max(255)
    .optional()
    .or(z.literal('')),
  portfolioUrl: z
    .string()
    .trim()
    .url('Enter a valid portfolio URL')
    .max(255)
    .optional()
    .or(z.literal('')),
  yearsOfExperience: z.coerce
    .number()
    .int()
    .min(0, 'Cannot be negative')
    .max(60)
    .optional()
    .nullable(),
  currentCompany: z.string().trim().max(120).optional().or(z.literal('')),
  expectedSalary: z.string().trim().max(60).optional().or(z.literal('')),
  noticePeriod: z.string().trim().max(60).optional().or(z.literal('')),
  coverLetter: z
    .string()
    .trim()
    .max(5000, 'Cover letter must be 5000 characters or fewer')
    .optional()
    .or(z.literal('')),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'Please consent to us processing your application' }),
  }),
  website: honeypotSchema,
});
export type JobApplicationInput = z.infer<typeof jobApplicationSchema>;

export const newsletterSchema = z.object({
  email: emailSchema,
  website: honeypotSchema,
});
export type NewsletterInput = z.infer<typeof newsletterSchema>;

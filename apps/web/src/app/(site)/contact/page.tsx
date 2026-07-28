import type { Metadata } from 'next';
import { PageHero } from '@/components/layout/page-hero';
import { Section } from '@/components/ui/section';
import { ContactForm } from '@/components/forms/contact-form';
import { Icon } from '@/components/ui/primitives';
import { getPage } from '@/lib/content';
import { getSettings } from '@/lib/site';
import { metaFromPage } from '@/lib/page-meta';

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPage('contact');
  return metaFromPage(page, {
    title: 'Contact',
    description: 'Get in touch with the RedFort team.',
    path: '/contact',
  });
}

/** Contact — office details, an optional map embed and the contact form. */
export default async function ContactPage() {
  const [page, settings] = await Promise.all([getPage('contact'), getSettings()]);

  const details = [
    settings.contactEmail && {
      icon: 'fa-solid fa-envelope',
      label: 'Email',
      value: settings.contactEmail,
    },
    settings.contactPhone && {
      icon: 'fa-solid fa-phone',
      label: 'Phone',
      value: settings.contactPhone,
    },
    (settings.addressLine1 || settings.city) && {
      icon: 'fa-solid fa-location-dot',
      label: 'Office',
      value: [settings.addressLine1, settings.city, settings.country].filter(Boolean).join(', '),
    },
    settings.officeHours && {
      icon: 'fa-solid fa-clock',
      label: 'Hours',
      value: settings.officeHours,
    },
  ].filter(Boolean) as { icon: string; label: string; value: string }[];

  return (
    <>
      <PageHero
        eyebrow={page?.eyebrow ?? 'Get in touch'}
        heading={page?.heading ?? 'Let’s'}
        accent={page?.headingAccent}
        subheading={
          page?.subheading ??
          'Questions about careers, culture or RedFort in general? We would love to hear from you.'
        }
      />

      <Section glow>
        <div className="grid items-start gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <div className="space-y-6">
              {details.map((detail) => (
                <div key={detail.label} className="flex items-start gap-4">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl border border-[var(--border-accent)] bg-[var(--accent-subtle)] text-[var(--accent)]">
                    <Icon name={detail.icon} />
                  </span>
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">
                      {detail.label}
                    </div>
                    <div className="mt-1 text-sm font-medium text-[var(--text-primary)]">
                      {detail.value}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {settings.mapEmbedUrl && (
              <div className="mt-8 overflow-hidden rounded-2xl border border-[var(--border)]">
                <iframe
                  src={settings.mapEmbedUrl}
                  title="Office location"
                  loading="lazy"
                  className="h-64 w-full"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>

          <ContactForm />
        </div>
      </Section>
    </>
  );
}

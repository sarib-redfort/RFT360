import Link from 'next/link';
import { PLANNER_PAGES } from '@rft360/shared';
import type { SiteSettings, NavigationItem } from '@/lib/site';
import { Logo } from './logo';
import { Icon } from '@/components/ui/primitives';

interface SocialLink {
  href: string;
  label: string;
  icon: string;
}

/** Only renders the social channels that are actually configured in the CMS. */
function socials(settings: SiteSettings): SocialLink[] {
  const map: [keyof SiteSettings, string, string][] = [
    ['socialLinkedin', 'LinkedIn', 'fa-brands fa-linkedin-in'],
    ['socialFacebook', 'Facebook', 'fa-brands fa-facebook-f'],
    ['socialInstagram', 'Instagram', 'fa-brands fa-instagram'],
    ['socialTwitter', 'X', 'fa-brands fa-x-twitter'],
    ['socialYoutube', 'YouTube', 'fa-brands fa-youtube'],
    ['socialTiktok', 'TikTok', 'fa-brands fa-tiktok'],
  ];
  return map
    .filter(([key]) => Boolean(settings[key]))
    .map(([key, label, icon]) => ({ href: String(settings[key]), label, icon }));
}

/**
 * Last-resort column if no footer navigation exists in the CMS at all — keeps
 * the footer useful on a fresh, unseeded database.
 */
const FALLBACK_COLUMN = {
  label: 'Explore',
  links: PLANNER_PAGES.map((p) => ({ label: p.label, href: p.path })),
};

/**
 * Site footer.
 *
 * Four-column layout on desktop (brand → explore → careers → contact),
 * collapsing to two columns on tablet and one on mobile. Content is CMS-driven
 * via site settings + footer navigation, falling back to the planner pages when
 * no footer menu has been configured.
 */
export function Footer({
  settings,
  footerNav,
}: {
  settings: SiteSettings;
  footerNav: NavigationItem[];
}) {
  const year = new Date().getFullYear();
  const links = socials(settings);

  /*
   * Link columns come entirely from CMS footer navigation (Admin → Navigation):
   * each top-level FOOTER item is a column, its children are the links. Two are
   * rendered to keep the four-column grid balanced.
   */
  const columns = footerNav
    .filter((item) => item.children && item.children.length > 0)
    .slice(0, 2)
    .map((item) => ({
      label: item.label,
      links: (item.children ?? []).map((c) => ({ label: c.label, href: c.href ?? '#' })),
    }));
  const linkColumns = columns.length > 0 ? columns : [FALLBACK_COLUMN];

  const address = [settings.addressLine1, settings.addressLine2, settings.city, settings.country]
    .filter(Boolean)
    .join(', ');

  return (
    <footer className="relative overflow-hidden border-t border-[var(--border)] bg-[var(--bg-surface)]">
      {/* Soft brand wash — no hard edges. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(90% 80% at 8% 0%, rgba(222,24,27,0.055) 0%, transparent 65%)',
        }}
      />

      <div className="container-rft relative py-16 md:py-20">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr_1.2fr] lg:gap-12">
          {/* ── Brand ─────────────────────────────────────────── */}
          <div>
            <Logo />
            <p className="mt-5 max-w-sm text-[0.875rem] leading-[1.75] text-[var(--text-secondary)]">
              {settings.footerText ??
                'Careers, culture and life at RFT360 — the people we work with and the work we do together.'}
            </p>

            {links.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2.5">
                {links.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.label}
                    className="tap-target flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-secondary)] transition-colors hover:border-[var(--border-accent)] hover:text-[var(--accent)]"
                  >
                    <Icon name={link.icon} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Link columns (CMS-driven) ─────────────────────── */}
          {linkColumns.map((column) => (
            <FooterColumn key={column.label} title={column.label} links={column.links} />
          ))}

          {/* ── Contact ───────────────────────────────────────── */}
          <div>
            <FooterHeading>Get in touch</FooterHeading>
            <ul className="mt-5 space-y-4">
              {settings.contactEmail && (
                <ContactRow icon="fa-solid fa-envelope">
                  <a
                    href={`mailto:${settings.contactEmail}`}
                    className="tap-link transition-colors hover:text-[var(--accent)]"
                  >
                    {settings.contactEmail}
                  </a>
                </ContactRow>
              )}
              {settings.contactPhone && (
                <ContactRow icon="fa-solid fa-phone">
                  <a
                    href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}
                    className="tap-link transition-colors hover:text-[var(--accent)]"
                  >
                    {settings.contactPhone}
                  </a>
                </ContactRow>
              )}
              {address && <ContactRow icon="fa-solid fa-location-dot">{address}</ContactRow>}
              {settings.officeHours && (
                <ContactRow icon="fa-solid fa-clock">{settings.officeHours}</ContactRow>
              )}
            </ul>

            <Link
              href="/careers"
              className="btn-primary mt-7 w-full justify-center sm:w-auto"
            >
              View Open Roles
              <Icon name="fa-solid fa-arrow-right" className="text-[0.7rem]" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ─────────────────────────────────────────── */}
      <div className="relative border-t border-[var(--border)]">
        <div className="container-rft flex flex-col items-center justify-between gap-3 py-6 text-[0.75rem] text-[var(--text-muted)] md:flex-row">
          <p>{settings.copyrightText ?? `© ${year} RFT360. All rights reserved.`}</p>
          <p className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]" aria-hidden />
            Careers & culture at RFT360
          </p>
        </div>
      </div>
    </footer>
  );
}

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    // 0.68rem is under 11px — legible on a monitor, squinting on a phone.
    <h4 className="text-[0.72rem] font-bold uppercase tracking-[1.6px] text-[var(--text-muted)] sm:text-[0.68rem] sm:tracking-[2px]">
      {children}
    </h4>
  );
}

function FooterColumn({
  title,
  links,
}: {
  title: string;
  links: { label: string; href: string }[];
}) {
  return (
    <div>
      <FooterHeading>{title}</FooterHeading>
      <ul className="mt-5 space-y-3 sm:space-y-2">
        {links.map((link) => (
          <li key={`${title}-${link.href}`}>
            <Link
              href={link.href}
              className="tap-link text-[0.875rem] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)]"
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

function ContactRow({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-3 text-[0.875rem] leading-relaxed text-[var(--text-secondary)]">
      <span className="mt-0.5 text-[0.75rem] text-[var(--accent)]">
        <Icon name={icon} />
      </span>
      <span>{children}</span>
    </li>
  );
}

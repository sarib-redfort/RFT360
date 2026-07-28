import { Navbar } from '@/components/layout/navbar';
import { Footer } from '@/components/layout/footer';
import { SideDots } from '@/components/ui/side-dots';
import { ScrollProgress } from '@/components/ui/scroll-progress';
import { ParallaxOrbs } from '@/components/ui/parallax-orbs';
import { getSettings, getHeaderNav, getFooterNav } from '@/lib/site';

/**
 * Public-site chrome. Wraps every marketing page in the shared header and
 * footer, both fed from CMS settings + navigation. The admin area uses its own
 * layout and does not include this.
 */
export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [settings, headerNav, footerNav] = await Promise.all([
    getSettings(),
    getHeaderNav(),
    getFooterNav(),
  ]);

  return (
    <>
      {/* Keyboard users can jump past the nav straight to the content. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[10000] focus:rounded-lg focus:bg-[var(--accent)] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Skip to content
      </a>
      <ScrollProgress />
      <ParallaxOrbs />
      <Navbar items={headerNav.map((i) => ({ label: i.label, href: i.href ?? '#' }))} />
      <SideDots />
      <main id="main" className="min-h-screen">
        {children}
      </main>
      <Footer settings={settings} footerNav={footerNav} />
    </>
  );
}

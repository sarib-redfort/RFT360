import { HomepageSectionType } from '@rft360/shared';
import type { HomepageSection, StatItem } from '@/lib/content-types';
import { HeroSection } from './hero-section';
import {
  AwardsSection,
  CaseStudiesSection,
  CertificationsSection,
  ContactFormSection,
  FaqSection,
  IndustriesSection,
  LatestBlogsSection,
  LogosSection,
  RichTextSection,
  ServicesSection,
  StatisticsSection,
  TeamSection,
  TestimonialsSection,
  WhoWeAreSection,
  WhyChooseUsSection,
} from './sections';

/**
 * Maps a homepage section (by `type`) to its component. Adding a new section
 * type is a single case here plus its API data resolver — the page itself never
 * changes. Unknown types render nothing, so the CMS can never break the page.
 */
/**
 * Section types that are meaningless without linked records — if the CMS has
 * none published, the section is skipped rather than rendering an empty
 * full-height band.
 */
const REQUIRES_DATA = new Set<string>([
  HomepageSectionType.SERVICES,
  HomepageSectionType.INDUSTRIES,
  HomepageSectionType.WHY_CHOOSE_US,
  HomepageSectionType.PERKS,
  HomepageSectionType.VALUES,
  HomepageSectionType.CASE_STUDIES,
  HomepageSectionType.TESTIMONIALS,
  HomepageSectionType.FAQ,
  HomepageSectionType.LATEST_BLOGS,
  HomepageSectionType.TEAM,
  HomepageSectionType.STATISTICS,
  HomepageSectionType.CLIENT_LOGOS,
  HomepageSectionType.PARTNER_LOGOS,
  HomepageSectionType.CERTIFICATIONS,
  HomepageSectionType.AWARDS,
]);

export function SectionRenderer({
  section,
  stats,
  contactEmail,
}: {
  section: HomepageSection;
  /** Passed to the hero so it can render the original's inline stat row. */
  stats?: StatItem[];
  /** Careers address, shown beside the contact form. */
  contactEmail?: string | null;
}) {
  if (REQUIRES_DATA.has(section.type) && !(Array.isArray(section.data) && section.data.length > 0)) {
    return null;
  }

  switch (section.type) {
    case HomepageSectionType.HERO:
      return <HeroSection section={section} stats={stats} />;
    case HomepageSectionType.WHO_WE_ARE:
      return <WhoWeAreSection section={section} />;
    case HomepageSectionType.SERVICES:
      return <ServicesSection section={section} />;
    case HomepageSectionType.WHY_CHOOSE_US:
    case HomepageSectionType.PERKS:
    case HomepageSectionType.VALUES:
      return <WhyChooseUsSection section={section} />;
    case HomepageSectionType.INDUSTRIES:
      return <IndustriesSection section={section} />;
    case HomepageSectionType.CASE_STUDIES:
      return <CaseStudiesSection section={section} />;
    case HomepageSectionType.TESTIMONIALS:
      return <TestimonialsSection section={section} />;
    case HomepageSectionType.FAQ:
      return <FaqSection section={section} />;
    case HomepageSectionType.LATEST_BLOGS:
      return <LatestBlogsSection section={section} />;
    case HomepageSectionType.CONTACT_FORM:
      return <ContactFormSection section={section} contactEmail={contactEmail} />;
    case HomepageSectionType.TEAM:
      return <TeamSection section={section} />;
    case HomepageSectionType.STATISTICS:
      return <StatisticsSection section={section} />;
    case HomepageSectionType.CLIENT_LOGOS:
    case HomepageSectionType.PARTNER_LOGOS:
      return <LogosSection section={section} />;
    case HomepageSectionType.CERTIFICATIONS:
      return <CertificationsSection section={section} />;
    case HomepageSectionType.AWARDS:
      return <AwardsSection section={section} />;
    case HomepageSectionType.CTA:
    case HomepageSectionType.RICH_TEXT:
      return <RichTextSection section={section} />;
    default:
      return null;
  }
}

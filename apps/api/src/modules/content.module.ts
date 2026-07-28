import { Module } from '@nestjs/common';
import { MediaModule } from './media/media.module';
import { SettingsModule } from './settings/settings.module';
import { PagesModule } from './pages/pages.module';
import { HomepageModule } from './homepage/homepage.module';
import { BlogModule } from './blog/blog.module';
import { CareersModule } from './careers/careers.module';
import { EventsModule } from './events/events.module';
import { GalleryModule } from './gallery/gallery.module';
import { SocialProofModule } from './social-proof/social-proof.module';
import { CapabilitiesModule } from './capabilities/capabilities.module';
import { PeopleModule } from './people/people.module';
import { TrustModule } from './trust/trust.module';
import { SubmissionsModule } from './submissions/submissions.module';
import { DashboardModule } from './dashboard/dashboard.module';

/**
 * Aggregates every CMS content feature module. `AppModule` imports this single
 * entry point; each feature stays independently testable.
 */
@Module({
  imports: [
    MediaModule,
    SettingsModule,
    PagesModule,
    HomepageModule,
    BlogModule,
    CareersModule,
    EventsModule,
    GalleryModule,
    SocialProofModule,
    CapabilitiesModule,
    PeopleModule,
    TrustModule,
    SubmissionsModule,
    DashboardModule,
  ],
})
export class ContentModule {}

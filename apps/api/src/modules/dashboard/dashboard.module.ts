import { Controller, Get, Injectable, Module } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { ApplicationStatus, ContentStatus, Role, SubmissionStatus } from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { Roles } from '../../common/decorators/roles.decorator';

/** Aggregates the headline counts shown on the CMS dashboard. */
@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      publishedPosts,
      draftPosts,
      openJobs,
      newApplications,
      newSubmissions,
      upcomingEvents,
      teamMembers,
      mediaCount,
    ] = await Promise.all([
      this.prisma.post.count({ where: { status: ContentStatus.PUBLISHED } }),
      this.prisma.post.count({ where: { status: ContentStatus.DRAFT } }),
      this.prisma.job.count({ where: { status: ContentStatus.PUBLISHED } }),
      this.prisma.jobApplication.count({ where: { status: ApplicationStatus.NEW } }),
      this.prisma.contactSubmission.count({ where: { status: SubmissionStatus.NEW } }),
      this.prisma.event.count({ where: { status: ContentStatus.PUBLISHED, startsAt: { gte: new Date() } } }),
      this.prisma.teamMember.count(),
      this.prisma.media.count(),
    ]);

    return {
      posts: { published: publishedPosts, draft: draftPosts },
      jobs: { open: openJobs, newApplications },
      submissions: { new: newSubmissions },
      events: { upcoming: upcomingEvents },
      team: teamMembers,
      media: mediaCount,
    };
  }

  async getRecentActivity() {
    const [recentApplications, recentSubmissions, recentPosts] = await Promise.all([
      this.prisma.jobApplication.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: { job: { select: { title: true } } },
      }),
      this.prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' }, take: 5 }),
      this.prisma.post.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        select: { id: true, title: true, slug: true, status: true, updatedAt: true },
      }),
    ]);
    return { recentApplications, recentSubmissions, recentPosts };
  }
}

@ApiTags('Admin · Dashboard')
@Controller('admin/dashboard')
@Roles(Role.VIEWER)
export class DashboardController {
  constructor(private readonly dashboard: DashboardService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Headline counts for the CMS dashboard' })
  stats() {
    return this.dashboard.getStats();
  }

  @Get('activity')
  @ApiOperation({ summary: 'Recent applications, submissions and edited posts' })
  activity() {
    return this.dashboard.getRecentActivity();
  }
}

@Module({
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}

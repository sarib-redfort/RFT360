import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import {
  ApplicationStatus,
  buildPaginationMeta,
  ContentStatus,
  type JobApplicationInput,
  type ListQueryInput,
  type PaginatedResult,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { MediaService } from '../media/media.service';
import { MailService } from '../mail/mail.service';
import { mediaSelect } from '../../common/prisma-includes';

/**
 * Handles inbound job applications: validates the target job is open, stores an
 * optional CV via the media pipeline, persists the application, and emails the
 * talent team. Also powers the recruiter inbox (list, view, status, notes).
 */
@Injectable()
export class ApplicationsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly media: MediaService,
    private readonly mail: MailService,
  ) {}

  async apply(
    input: JobApplicationInput,
    resume: Express.Multer.File | undefined,
    ip?: string,
  ) {
    const job = await this.prisma.job.findUnique({ where: { id: input.jobId } });
    if (!job || job.status !== ContentStatus.PUBLISHED) {
      throw new NotFoundException('This position is no longer accepting applications');
    }
    if (job.applicationDeadline && job.applicationDeadline < new Date()) {
      throw new BadRequestException('The application deadline for this role has passed');
    }

    let resumeId: string | undefined;
    if (resume) {
      const media = await this.media.upload(resume, job.createdById ?? 'system', 'applications');
      resumeId = media.id;
    }

    // `consent` and the honeypot `website` are validation-only — never stored.
    const { consent: _c, website: _w, ...rest } = input;
    const application = await this.prisma.jobApplication.create({
      data: { ...rest, resumeId, ip },
    });

    await this.notify(job.title, application);
    return { id: application.id, success: true };
  }

  async list(
    jobId: string | undefined,
    // Omit the content `status` from the base query — applications use their
    // own ApplicationStatus pipeline, not DRAFT/PUBLISHED/ARCHIVED.
    query: Omit<ListQueryInput, 'status'> & { status?: ApplicationStatus },
  ): Promise<PaginatedResult<unknown>> {
    const where: Record<string, unknown> = {};
    if (jobId) where.jobId = jobId;
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.prisma.jobApplication.findMany({
        where,
        include: {
          job: { select: { id: true, title: true, slug: true } },
          resume: mediaSelect,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.jobApplication.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async findById(id: string) {
    const application = await this.prisma.jobApplication.findUnique({
      where: { id },
      include: { job: { select: { id: true, title: true, slug: true } }, resume: mediaSelect },
    });
    if (!application) throw new NotFoundException('Application not found');
    return application;
  }

  async updateStatus(id: string, status: ApplicationStatus, notes?: string) {
    await this.findById(id);
    return this.prisma.jobApplication.update({
      where: { id },
      data: { status, ...(notes !== undefined ? { notes } : {}) },
    });
  }

  async remove(id: string) {
    const application = await this.findById(id);
    if (application.resumeId) await this.media.remove(application.resumeId).catch(() => undefined);
    await this.prisma.jobApplication.delete({ where: { id } });
    return { id };
  }

  private async notify(jobTitle: string, application: { firstName: string; lastName: string; email: string; phone: string }) {
    await this.mail.send({
      to: this.mail.notifyTo,
      subject: `New application: ${jobTitle}`,
      replyTo: application.email,
      html: `
        <h2>New job application</h2>
        <p><strong>Role:</strong> ${jobTitle}</p>
        <p><strong>Candidate:</strong> ${application.firstName} ${application.lastName}</p>
        <p><strong>Email:</strong> ${application.email}</p>
        <p><strong>Phone:</strong> ${application.phone}</p>
        <p>Open the CMS to review the full application and CV.</p>
      `,
    });
  }
}

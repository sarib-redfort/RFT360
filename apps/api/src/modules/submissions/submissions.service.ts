import { Injectable } from '@nestjs/common';
import {
  buildPaginationMeta,
  SubmissionStatus,
  type ContactFormInput,
  type ListQueryInput,
  type PaginatedResult,
} from '@rft360/shared';
import { PrismaService } from '../../prisma/prisma.service';
import { MailService } from '../mail/mail.service';

/**
 * Contact-form intake and the staff inbox. Submissions are always stored (so
 * nothing is lost if email fails); the notification email is best-effort.
 */
@Injectable()
export class SubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mail: MailService,
  ) {}

  async submit(input: ContactFormInput, meta: { ip?: string; userAgent?: string }) {
    // consent + honeypot are validation-only; strip before persisting.
    const { consent: _c, website: _w, ...rest } = input;
    const submission = await this.prisma.contactSubmission.create({
      data: { ...rest, ip: meta.ip, userAgent: meta.userAgent?.slice(0, 255) },
    });

    await this.mail.send({
      to: this.mail.notifyTo,
      subject: `New enquiry: ${input.subject || 'Contact form'}`,
      replyTo: input.email,
      html: `
        <h2>New contact submission</h2>
        <p><strong>From:</strong> ${input.firstName} ${input.lastName} (${input.email})</p>
        ${input.company ? `<p><strong>Company:</strong> ${input.company}</p>` : ''}
        ${input.phone ? `<p><strong>Phone:</strong> ${input.phone}</p>` : ''}
        <p><strong>Message:</strong></p>
        <p>${input.message.replace(/\n/g, '<br>')}</p>
      `,
    });

    return { id: submission.id, success: true };
  }

  async list(
    query: Omit<ListQueryInput, 'status'> & { status?: SubmissionStatus },
  ): Promise<PaginatedResult<unknown>> {
    const where: Record<string, unknown> = {};
    if (query.status) where.status = query.status;
    if (query.search) {
      where.OR = [
        { firstName: { contains: query.search, mode: 'insensitive' } },
        { lastName: { contains: query.search, mode: 'insensitive' } },
        { email: { contains: query.search, mode: 'insensitive' } },
        { subject: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    const skip = (query.page - 1) * query.limit;
    const [data, total] = await Promise.all([
      this.prisma.contactSubmission.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: query.limit,
      }),
      this.prisma.contactSubmission.count({ where }),
    ]);
    return { data, meta: buildPaginationMeta(total, query.page, query.limit) };
  }

  async findById(id: string) {
    const submission = await this.prisma.contactSubmission.findUniqueOrThrow({ where: { id } });
    // Auto-mark NEW submissions READ on first open.
    if (submission.status === SubmissionStatus.NEW) {
      return this.prisma.contactSubmission.update({
        where: { id },
        data: { status: SubmissionStatus.READ },
      });
    }
    return submission;
  }

  updateStatus(id: string, status: SubmissionStatus, notes?: string) {
    return this.prisma.contactSubmission.update({
      where: { id },
      data: { status, ...(notes !== undefined ? { notes } : {}) },
    });
  }

  async remove(id: string) {
    await this.prisma.contactSubmission.delete({ where: { id } });
    return { id };
  }

  /** Exports all submissions as CSV text for download. */
  async exportCsv(): Promise<string> {
    const rows = await this.prisma.contactSubmission.findMany({ orderBy: { createdAt: 'desc' } });
    const header = [
      'Date',
      'First Name',
      'Last Name',
      'Email',
      'Phone',
      'Company',
      'Subject',
      'Message',
      'Status',
    ];
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const lines = rows.map((r) =>
      [
        r.createdAt.toISOString(),
        r.firstName,
        r.lastName,
        r.email,
        r.phone,
        r.company,
        r.subject,
        r.message,
        r.status,
      ]
        .map(escape)
        .join(','),
    );
    return [header.join(','), ...lines].join('\n');
  }
}

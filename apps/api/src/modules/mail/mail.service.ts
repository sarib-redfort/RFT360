import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';

export interface MailMessage {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

/**
 * Sends transactional email through SMTP (Mailpit in dev, real SMTP in prod).
 *
 * Sending is best-effort and non-blocking for the caller: a mail failure logs a
 * warning but never fails the underlying request (a contact form still succeeds
 * even if the notification email bounces).
 */
@Injectable()
export class MailService implements OnModuleInit {
  private readonly logger = new Logger(MailService.name);
  private transporter!: Transporter;

  constructor(private readonly config: ConfigService) {}

  onModuleInit() {
    const mail = this.config.get('mail')!;
    this.transporter = nodemailer.createTransport({
      host: mail.host,
      port: mail.port,
      secure: mail.secure,
      auth: mail.user ? { user: mail.user, pass: mail.password } : undefined,
    });
  }

  async send(message: MailMessage): Promise<boolean> {
    try {
      const from = this.config.get<string>('mail.from');
      await this.transporter.sendMail({
        from,
        to: message.to,
        subject: message.subject,
        html: message.html,
        text: message.text ?? this.htmlToText(message.html),
        replyTo: message.replyTo,
      });
      return true;
    } catch (error) {
      this.logger.warn(`Email send failed (${message.subject}): ${(error as Error).message}`);
      return false;
    }
  }

  /** The address that receives contact/application notifications. */
  get notifyTo(): string {
    return this.config.get<string>('mail.notifyTo', 'careers@redfort360.com');
  }

  private htmlToText(html: string): string {
    return html
      .replace(/<style[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}

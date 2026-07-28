import { BadRequestException, Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';
import { extname } from 'node:path';
import { randomUUID } from 'node:crypto';
import {
  IMAGE_VARIANTS,
  MediaType,
  UPLOAD_LIMITS,
  type ImageVariant,
} from '@rft360/shared';
import { STORAGE_DRIVER, type StorageDriver } from './storage.interface';

/** Everything needed to persist a `Media` row after an upload. */
export interface ProcessedUpload {
  type: MediaType;
  storageKey: string;
  filename: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  variants?: Record<string, { key: string; url: string; width: number; height: number }>;
  blurDataUrl?: string;
  url: string;
}

/**
 * Turns a raw uploaded file into stored objects.
 *
 * Raster images get resized into thumbnail/medium/large WebP variants plus a
 * tiny blurred placeholder (for `next/image` blur-up). SVGs and documents are
 * stored as-is. All writes go through the configured {@link StorageDriver}, so
 * this class is storage-backend agnostic.
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);

  constructor(
    @Inject(STORAGE_DRIVER) private readonly driver: StorageDriver,
    private readonly config: ConfigService,
  ) {}

  getUrl(key: string): string {
    return this.driver.getUrl(key);
  }

  async delete(...keys: (string | null | undefined)[]): Promise<void> {
    await Promise.all(keys.filter((k): k is string => !!k).map((key) => this.driver.delete(key)));
  }

  /** Validates and stores an uploaded file, generating variants for images. */
  async processUpload(
    file: Express.Multer.File,
    folder = 'uploads',
  ): Promise<ProcessedUpload> {
    this.assertAllowed(file);

    const isRasterImage =
      file.mimetype.startsWith('image/') && file.mimetype !== 'image/svg+xml';
    return isRasterImage
      ? this.processImage(file, folder)
      : this.processGenericFile(file, folder);
  }

  private async processImage(
    file: Express.Multer.File,
    folder: string,
  ): Promise<ProcessedUpload> {
    const id = randomUUID();
    const base = `${folder}/${id}`;

    let pipeline = sharp(file.buffer, { failOn: 'none' }).rotate();
    const metadata = await pipeline.metadata();

    // Store the original (re-encoded to strip metadata / normalise orientation).
    const originalKey = `${base}/original.webp`;
    const originalBuffer = await pipeline.webp({ quality: 90 }).toBuffer();
    await this.driver.put(originalKey, originalBuffer, 'image/webp');

    const variants: ProcessedUpload['variants'] = {};
    for (const [name, dims] of Object.entries(IMAGE_VARIANTS) as [
      ImageVariant,
      { width: number; height: number },
    ][]) {
      // Never upscale — skip a variant larger than the source.
      if (metadata.width && metadata.width < dims.width && name !== 'thumbnail') continue;
      const buffer = await sharp(file.buffer, { failOn: 'none' })
        .rotate()
        .resize(dims.width, dims.height, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 82 })
        .toBuffer();
      const key = `${base}/${name}.webp`;
      const stored = await this.driver.put(key, buffer, 'image/webp');
      const meta = await sharp(buffer).metadata();
      variants[name] = {
        key,
        url: stored.url,
        width: meta.width ?? dims.width,
        height: meta.height ?? dims.height,
      };
    }

    const blurDataUrl = await this.generateBlurPlaceholder(file.buffer);

    return {
      type: MediaType.IMAGE,
      storageKey: originalKey,
      filename: `${id}.webp`,
      mimeType: 'image/webp',
      size: originalBuffer.length,
      width: metadata.width,
      height: metadata.height,
      variants,
      blurDataUrl,
      url: this.driver.getUrl(originalKey),
    };
  }

  private async processGenericFile(
    file: Express.Multer.File,
    folder: string,
  ): Promise<ProcessedUpload> {
    const id = randomUUID();
    const ext = extname(file.originalname) || this.extFromMime(file.mimetype);
    const key = `${folder}/${id}${ext}`;
    const stored = await this.driver.put(key, file.buffer, file.mimetype);

    return {
      type: this.classify(file.mimetype),
      storageKey: key,
      filename: `${id}${ext}`,
      mimeType: file.mimetype,
      size: file.size,
      url: stored.url,
    };
  }

  /** A ~20px wide inline WebP data URI for progressive blur-up loading. */
  private async generateBlurPlaceholder(buffer: Buffer): Promise<string | undefined> {
    try {
      const placeholder = await sharp(buffer)
        .rotate()
        .resize(20, 20, { fit: 'inside' })
        .webp({ quality: 40 })
        .toBuffer();
      return `data:image/webp;base64,${placeholder.toString('base64')}`;
    } catch (error) {
      this.logger.warn(`Blur placeholder failed: ${(error as Error).message}`);
      return undefined;
    }
  }

  private assertAllowed(file: Express.Multer.File): void {
    const maxBytes = this.config.get<number>('storage.maxUploadBytes', UPLOAD_LIMITS.maxImageBytes);
    if (file.size > maxBytes) {
      throw new BadRequestException(
        `File exceeds the ${(maxBytes / 1024 / 1024).toFixed(0)} MB limit`,
      );
    }
    const allowed = [
      ...UPLOAD_LIMITS.allowedImageMimeTypes,
      ...UPLOAD_LIMITS.allowedDocumentMimeTypes,
    ];
    if (!allowed.includes(file.mimetype as (typeof allowed)[number])) {
      throw new BadRequestException(`Unsupported file type: ${file.mimetype}`);
    }
  }

  private classify(mime: string): MediaType {
    if (mime.startsWith('image/')) return MediaType.IMAGE;
    if (mime.startsWith('video/')) return MediaType.VIDEO;
    if (
      mime === 'application/pdf' ||
      mime.includes('word') ||
      mime.includes('document')
    ) {
      return MediaType.DOCUMENT;
    }
    return MediaType.OTHER;
  }

  private extFromMime(mime: string): string {
    const map: Record<string, string> = {
      'application/pdf': '.pdf',
      'application/msword': '.doc',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
      'image/svg+xml': '.svg',
    };
    return map[mime] ?? '';
  }
}

import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import type { Readable } from 'node:stream';
import { Logger } from '@nestjs/common';
import type { StorageDriver, StoredObject } from '../storage.interface';

export interface S3DriverConfig {
  endpoint?: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  publicUrl?: string;
  forcePathStyle: boolean;
}

/**
 * Stores uploads in an S3-compatible bucket (AWS S3, Cloudflare R2, MinIO).
 *
 * Selected by `STORAGE_DRIVER=s3`. Implements the same {@link StorageDriver}
 * contract as the local driver, so nothing else changes when switching.
 */
export class S3StorageDriver implements StorageDriver {
  private readonly logger = new Logger(S3StorageDriver.name);
  private readonly client: S3Client;

  constructor(private readonly config: S3DriverConfig) {
    this.client = new S3Client({
      endpoint: config.endpoint || undefined,
      region: config.region,
      forcePathStyle: config.forcePathStyle,
      credentials: {
        accessKeyId: config.accessKeyId,
        secretAccessKey: config.secretAccessKey,
      },
    });
  }

  async put(key: string, body: Buffer | Readable, contentType: string): Promise<StoredObject> {
    await this.client.send(
      new PutObjectCommand({
        Bucket: this.config.bucket,
        Key: key,
        Body: body,
        ContentType: contentType,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );
    return { key, url: this.getUrl(key) };
  }

  async delete(key: string): Promise<void> {
    try {
      await this.client.send(
        new DeleteObjectCommand({ Bucket: this.config.bucket, Key: key }),
      );
    } catch (error) {
      this.logger.warn(`Failed to delete ${key}: ${(error as Error).message}`);
    }
  }

  getUrl(key: string): string {
    if (this.config.publicUrl) {
      return `${this.config.publicUrl.replace(/\/$/, '')}/${key}`;
    }
    // Fall back to a path-style bucket URL when no CDN base is configured.
    const base = this.config.endpoint?.replace(/\/$/, '') ?? `https://s3.${this.config.region}.amazonaws.com`;
    return `${base}/${this.config.bucket}/${key}`;
  }

  async get(key: string): Promise<Buffer> {
    const result = await this.client.send(
      new GetObjectCommand({ Bucket: this.config.bucket, Key: key }),
    );
    const bytes = await result.Body?.transformToByteArray();
    if (!bytes) throw new Error(`Object ${key} has no body`);
    return Buffer.from(bytes);
  }

  async exists(key: string): Promise<boolean> {
    try {
      await this.client.send(new HeadObjectCommand({ Bucket: this.config.bucket, Key: key }));
      return true;
    } catch {
      return false;
    }
  }
}

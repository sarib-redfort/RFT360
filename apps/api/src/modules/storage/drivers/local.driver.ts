import { promises as fs, createReadStream } from 'node:fs';
import * as path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import type { Readable } from 'node:stream';
import { Logger } from '@nestjs/common';
import type { StorageDriver, StoredObject } from '../storage.interface';

/**
 * Stores uploads on the server's local filesystem.
 *
 * The default driver for development and single-node deployments. Files live
 * under `basePath` and are served by a static route mounted at `publicUrl`.
 * Keys are validated to keep every write inside `basePath` (no path traversal).
 */
export class LocalStorageDriver implements StorageDriver {
  private readonly logger = new Logger(LocalStorageDriver.name);

  constructor(
    private readonly basePath: string,
    private readonly publicUrl: string,
  ) {}

  async put(key: string, body: Buffer | Readable, _contentType: string): Promise<StoredObject> {
    const absolute = this.resolve(key);
    await fs.mkdir(path.dirname(absolute), { recursive: true });

    if (Buffer.isBuffer(body)) {
      await fs.writeFile(absolute, body);
    } else {
      await pipeline(body, createWriteStream(absolute));
    }
    return { key, url: this.getUrl(key) };
  }

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(this.resolve(key));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
        this.logger.warn(`Failed to delete ${key}: ${(error as Error).message}`);
      }
    }
  }

  getUrl(key: string): string {
    return `${this.publicUrl.replace(/\/$/, '')}/${key.split(path.sep).join('/')}`;
  }

  async get(key: string): Promise<Buffer> {
    return fs.readFile(this.resolve(key));
  }

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(this.resolve(key));
      return true;
    } catch {
      return false;
    }
  }

  /** Resolves a key to an absolute path, rejecting traversal outside basePath. */
  private resolve(key: string): string {
    const normalized = path.normalize(key).replace(/^(\.\.(\/|\\|$))+/, '');
    const absolute = path.resolve(this.basePath, normalized);
    const root = path.resolve(this.basePath);
    if (!absolute.startsWith(root + path.sep) && absolute !== root) {
      throw new Error('Invalid storage key: path traversal detected');
    }
    return absolute;
  }

  /** Creates the storage root readers can rely on existing. */
  static async ensureRoot(basePath: string): Promise<void> {
    await fs.mkdir(path.resolve(basePath), { recursive: true });
  }

  /** Streams a file for direct download (used by the static-serve fallback). */
  createReadStream(key: string) {
    return createReadStream(this.resolve(key));
  }
}

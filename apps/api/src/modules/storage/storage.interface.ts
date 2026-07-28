import type { Readable } from 'node:stream';

/** A single stored object plus the public URL that serves it. */
export interface StoredObject {
  /** Driver-relative key, persisted as `Media.storageKey`. */
  key: string;
  /** Absolute, publicly reachable URL. */
  url: string;
}

/**
 * Storage abstraction implemented by {@link LocalStorageDriver} and
 * {@link S3StorageDriver}. Swapping `STORAGE_DRIVER` between `local` and `s3`
 * changes nothing else in the codebase — every consumer depends on this
 * interface, never on a concrete driver.
 */
export interface StorageDriver {
  /** Persists a buffer under `key` and returns its key + public URL. */
  put(key: string, body: Buffer | Readable, contentType: string): Promise<StoredObject>;

  /** Removes an object. Missing objects resolve without error (idempotent). */
  delete(key: string): Promise<void>;

  /** Resolves a stored key to its absolute public URL. */
  getUrl(key: string): string;

  /** Reads an object back into memory (used for regenerating variants, etc.). */
  get(key: string): Promise<Buffer>;

  /** True if an object exists at `key`. */
  exists(key: string): Promise<boolean>;
}

/** Injection token for the active driver. */
export const STORAGE_DRIVER = 'STORAGE_DRIVER';

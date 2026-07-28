'use server';

import { revalidatePath } from 'next/cache';
import { adminMutate } from '@/lib/admin-api';

/**
 * Server actions for the CMS.
 *
 * Mutations run on the server so the access token never reaches the browser.
 * Client editors call these actions; each returns a `{ ok, error }` result the
 * UI can surface, and revalidates the relevant admin list path.
 */

type Result<T = unknown> = { ok: true; data: T } | { ok: false; error: string };

async function run<T>(fn: () => Promise<T>, revalidate?: string): Promise<Result<T>> {
  try {
    const data = await fn();
    if (revalidate) revalidatePath(revalidate);
    return { ok: true, data };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/** Create or update a resource record. */
export async function saveResource(
  path: string,
  id: string | null,
  data: Record<string, unknown>,
): Promise<Result> {
  return run(
    () =>
      id
        ? adminMutate('PATCH', `/admin/${path}/${id}`, data)
        : adminMutate('POST', `/admin/${path}`, data),
    `/admin/${path}`,
  );
}

export async function deleteResource(path: string, id: string): Promise<Result> {
  return run(() => adminMutate('DELETE', `/admin/${path}/${id}`), `/admin/${path}`);
}

export async function setStatus(
  path: string,
  id: string,
  action: 'publish' | 'unpublish' | 'archive',
): Promise<Result> {
  return run(() => adminMutate('POST', `/admin/${path}/${id}/${action}`), `/admin/${path}`);
}

export async function reorderResource(
  path: string,
  items: { id: string; order: number }[],
): Promise<Result> {
  return run(() => adminMutate('POST', `/admin/${path}/reorder`, { items }), `/admin/${path}`);
}

/** Update the site-settings singleton. */
export async function saveSettings(data: Record<string, unknown>): Promise<Result> {
  return run(() => adminMutate('PATCH', '/admin/settings', data), '/admin/settings');
}

/** Navigation builder actions. */
export async function saveNavItem(id: string | null, data: Record<string, unknown>): Promise<Result> {
  return run(
    () => (id ? adminMutate('PATCH', `/admin/navigation/${id}`, data) : adminMutate('POST', '/admin/navigation', data)),
    '/admin/navigation',
  );
}
export async function deleteNavItem(id: string): Promise<Result> {
  return run(() => adminMutate('DELETE', `/admin/navigation/${id}`), '/admin/navigation');
}

/** Submission / application inbox actions. */
export async function updateSubmissionStatus(id: string, status: string): Promise<Result> {
  return run(() => adminMutate('PATCH', `/admin/submissions/${id}/status`, { status }), '/admin/submissions');
}
export async function updateApplicationStatus(id: string, status: string, notes?: string): Promise<Result> {
  return run(
    () => adminMutate('PATCH', `/admin/applications/${id}/status`, { status, notes }),
    '/admin/applications',
  );
}

/** Delete a media library item. */
export async function deleteMedia(id: string): Promise<Result> {
  return run(() => adminMutate('DELETE', `/admin/media/${id}`), '/admin/media');
}

/** Gallery album + image actions. */
export async function createAlbum(data: Record<string, unknown>): Promise<Result> {
  return run(() => adminMutate('POST', '/admin/gallery-albums', data), '/admin/gallery');
}
export async function deleteAlbum(id: string): Promise<Result> {
  return run(() => adminMutate('DELETE', `/admin/gallery-albums/${id}`), '/admin/gallery');
}
export async function addAlbumImage(albumId: string, mediaId: string): Promise<Result> {
  return run(
    () => adminMutate('POST', '/admin/gallery-albums/images', { albumId, mediaId }),
    `/admin/gallery/${albumId}`,
  );
}
export async function removeAlbumImage(imageId: string, albumId: string): Promise<Result> {
  return run(
    () => adminMutate('DELETE', `/admin/gallery-albums/images/${imageId}`),
    `/admin/gallery/${albumId}`,
  );
}

/** User management actions (ADMIN+). */
export async function saveUser(id: string | null, data: Record<string, unknown>): Promise<Result> {
  return run(
    () => (id ? adminMutate('PATCH', `/admin/users/${id}`, data) : adminMutate('POST', '/admin/users', data)),
    '/admin/users',
  );
}
export async function deleteUser(id: string): Promise<Result> {
  return run(() => adminMutate('DELETE', `/admin/users/${id}`), '/admin/users');
}
export async function resetUserPassword(id: string, newPassword: string): Promise<Result> {
  return run(() => adminMutate('POST', `/admin/users/${id}/reset-password`, { newPassword }));
}

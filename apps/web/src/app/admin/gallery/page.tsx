import { adminGet } from '@/lib/admin-api';
import { GalleryManager } from './gallery-manager';
import type { PaginatedResult } from '@rft360/shared';
import type { MediaRef } from '@/lib/utils';

interface Album {
  id: string;
  title: string;
  slug: string;
  images?: { id: string; media: MediaRef }[];
}

/** Gallery admin — albums and their photos. */
export default async function GalleryAdminPage() {
  const result = await adminGet<PaginatedResult<Album>>('/admin/gallery-albums', { limit: 50 }).catch(
    () => ({ data: [] as Album[], meta: null }),
  );

  return (
    <div>
      <h1 className="font-[var(--font-heading)] text-2xl font-bold">Gallery</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--text-secondary)]">
        Create albums and add photos from the media library.
      </p>
      <GalleryManager initial={result.data ?? []} />
    </div>
  );
}

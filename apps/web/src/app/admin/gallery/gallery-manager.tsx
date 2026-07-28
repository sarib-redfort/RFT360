'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { slugify } from '@rft360/shared';
import { createAlbum, deleteAlbum, addAlbumImage, removeAlbumImage } from '@/app/admin/actions';
import { MediaPickerDialog } from '@/components/admin/media/media-picker-dialog';
import { mediaSrc, type MediaRef } from '@/lib/utils';

interface AlbumImage {
  id: string;
  media: MediaRef;
}
interface Album {
  id: string;
  title: string;
  slug: string;
  images?: AlbumImage[];
}

/** Gallery manager: create albums and add/remove photos from each. */
export function GalleryManager({ initial }: { initial: Album[] }) {
  const router = useRouter();
  const [albums, setAlbums] = useState(initial);
  const [newTitle, setNewTitle] = useState('');
  const [pickerAlbum, setPickerAlbum] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const create = () =>
    startTransition(async () => {
      if (!newTitle.trim()) return;
      const result = await createAlbum({ title: newTitle, slug: slugify(newTitle) });
      if (result.ok) {
        toast.success('Album created');
        setNewTitle('');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });

  const remove = (id: string) =>
    startTransition(async () => {
      if (!confirm('Delete this album and its photos?')) return;
      const result = await deleteAlbum(id);
      if (result.ok) {
        setAlbums((cur) => cur.filter((a) => a.id !== id));
        toast.success('Deleted');
      } else toast.error(result.error);
    });

  const addImage = (albumId: string, mediaId: string) =>
    startTransition(async () => {
      const result = await addAlbumImage(albumId, mediaId);
      if (result.ok) {
        toast.success('Photo added');
        router.refresh();
      } else toast.error(result.error);
    });

  const removeImage = (imageId: string, albumId: string) =>
    startTransition(async () => {
      const result = await removeAlbumImage(imageId, albumId);
      if (result.ok) {
        toast.success('Photo removed');
        router.refresh();
      } else toast.error(result.error);
    });

  return (
    <div className="space-y-6">
      <div className="flex items-end gap-2 rounded-2xl border border-dashed border-[var(--border)] p-4">
        <input
          className="flex-1 rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm"
          placeholder="New album title"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
        />
        <button
          type="button"
          onClick={create}
          disabled={pending}
          className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
        >
          Create album
        </button>
      </div>

      {albums.map((album) => (
        <section key={album.id} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[var(--font-heading)] text-lg font-semibold text-[var(--text-primary)]">
              {album.title}
            </h2>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPickerAlbum(album.id)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
              >
                + Add photos
              </button>
              <button
                type="button"
                onClick={() => remove(album.id)}
                className="rounded-lg border border-[var(--border)] px-3 py-1.5 text-sm text-[var(--text-muted)] hover:text-red-600"
              >
                Delete
              </button>
            </div>
          </div>
          {album.images && album.images.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {album.images.map((img) => {
                const src = mediaSrc(img.media, 'thumbnail');
                return (
                  <div key={img.id} className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--border)]">
                    {src && <Image src={src} alt="" fill sizes="120px" className="object-cover" />}
                    <button
                      type="button"
                      onClick={() => removeImage(img.id, album.id)}
                      className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded bg-black/60 text-white opacity-0 group-hover:opacity-100"
                      aria-label="Remove"
                    >
                      <i className="fa-solid fa-xmark text-xs" aria-hidden />
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-[var(--text-muted)]">No photos yet.</p>
          )}
        </section>
      ))}

      {pickerAlbum && (
        <MediaPickerDialog
          onClose={() => setPickerAlbum(null)}
          onSelect={(media) => {
            addImage(pickerAlbum, media.id);
            setPickerAlbum(null);
          }}
        />
      )}
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { clientGet, clientUpload } from '@/lib/admin-client';
import { mediaSrc, type MediaRef } from '@/lib/utils';

export interface PickedMedia {
  id: string;
  url: string | null;
  alt?: string | null;
}

interface MediaRecord extends MediaRef {
  id: string;
  originalName?: string;
}

/**
 * Modal media browser + uploader. Lists the media library, supports drag-free
 * file upload, and returns the chosen item via `onSelect`. Shared by the Tiptap
 * image button and the `media` form field.
 */
export function MediaPickerDialog({
  onClose,
  onSelect,
}: {
  onClose: () => void;
  onSelect: (media: PickedMedia) => void;
}) {
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const result = await clientGet<{ data: MediaRecord[] }>('/admin/media', {
        limit: '60',
        type: 'IMAGE',
      });
      setItems(result.data);
    } catch {
      toast.error('Could not load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const media = await clientUpload(file);
        setItems((prev) => [media as MediaRecord, ...prev]);
      }
      toast.success('Uploaded');
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="flex max-h-[80vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[var(--border)] px-5 py-3">
          <h3 className="font-semibold text-[var(--text-primary)]">Media library</h3>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              disabled={uploading}
              className="rounded-lg bg-[var(--accent)] px-3 py-1.5 text-sm font-semibold text-white disabled:opacity-50"
            >
              {uploading ? 'Uploading…' : 'Upload'}
            </button>
            <button type="button" onClick={onClose} aria-label="Close" className="px-2 text-[var(--text-muted)]">
              ✕
            </button>
          </div>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleUpload(e.target.files)}
          />
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {loading ? (
            <p className="py-10 text-center text-sm text-[var(--text-muted)]">Loading…</p>
          ) : items.length === 0 ? (
            <p className="py-10 text-center text-sm text-[var(--text-muted)]">
              No images yet — upload one to get started.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {items.map((item) => {
                const src = mediaSrc(item, 'thumbnail');
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSelect({ id: item.id, url: mediaSrc(item, 'medium'), alt: item.alt })}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] hover:border-[var(--accent)]"
                  >
                    {src && (
                      <Image src={src} alt={item.alt ?? ''} fill sizes="120px" className="object-cover" />
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

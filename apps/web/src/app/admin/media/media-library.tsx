'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { clientGet, clientUpload } from '@/lib/admin-client';
import { deleteMedia } from '@/app/admin/actions';
import { mediaSrc, formatDate, type MediaRef } from '@/lib/utils';

interface MediaRecord extends MediaRef {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: string;
  createdAt: string;
}

/** Media library — grid of uploads with drag-drop upload and delete. */
export function MediaLibrary() {
  const [items, setItems] = useState<MediaRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    try {
      const res = await clientGet<{ data: MediaRecord[] }>('/admin/media', { limit: '100' });
      setItems(res.data);
    } catch {
      toast.error('Could not load media');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const upload = async (files: FileList | File[] | null) => {
    if (!files) return;
    const list = Array.from(files);
    if (list.length === 0) return;
    setUploading(true);
    try {
      for (const file of list) {
        const media = await clientUpload(file);
        setItems((prev) => [media as MediaRecord, ...prev]);
      }
      toast.success(`Uploaded ${list.length} file(s)`);
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setUploading(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this file? Anything using it will lose its image.')) return;
    const result = await deleteMedia(id);
    if (result.ok) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      toast.success('Deleted');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          void upload(e.dataTransfer.files);
        }}
        className={`mb-6 flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 text-center transition-colors ${
          dragOver ? 'border-[var(--accent)] bg-[var(--accent-subtle)]' : 'border-[var(--border)]'
        }`}
      >
        <i className="fa-solid fa-cloud-arrow-up text-3xl text-[var(--text-muted)]" aria-hidden />
        <p className="mt-3 text-sm text-[var(--text-secondary)]">
          Drag &amp; drop files here, or{' '}
          <button type="button" onClick={() => inputRef.current?.click()} className="font-semibold text-[var(--accent)]">
            browse
          </button>
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">Images and PDFs up to 10 MB</p>
        {uploading && <p className="mt-2 text-xs text-[var(--accent)]">Uploading…</p>}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,application/pdf"
          className="hidden"
          onChange={(e) => upload(e.target.files)}
        />
      </div>

      {loading ? (
        <p className="text-center text-sm text-[var(--text-muted)]">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-center text-sm text-[var(--text-muted)]">No media yet.</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => {
            const src = mediaSrc(item, 'thumbnail');
            return (
              <div key={item.id} className="group overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                <div className="relative aspect-square bg-[var(--bg-surface)]">
                  {item.type === 'IMAGE' && src ? (
                    <Image src={src} alt={item.alt ?? item.originalName} fill sizes="200px" className="object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-[var(--text-muted)]">
                      <i className="fa-solid fa-file-lines text-3xl" aria-hidden />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => remove(item.id)}
                    aria-label="Delete"
                    className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 hover:bg-red-600"
                  >
                    <i className="fa-solid fa-trash text-xs" aria-hidden />
                  </button>
                </div>
                <div className="p-2">
                  <p className="truncate text-xs font-medium text-[var(--text-primary)]">{item.originalName}</p>
                  <p className="text-[0.65rem] text-[var(--text-muted)]">
                    {(item.size / 1024).toFixed(0)} KB · {formatDate(item.createdAt)}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

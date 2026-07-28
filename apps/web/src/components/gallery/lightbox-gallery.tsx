'use client';

import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { mediaSrc, type MediaRef } from '@/lib/utils';

interface GalleryImage {
  id: string;
  caption?: string | null;
  media: MediaRef;
}

/**
 * Masonry-ish image grid with an accessible lightbox. Clicking a thumbnail
 * opens a full-size overlay; arrow keys and Escape navigate/close. Body scroll
 * is locked while open.
 */
export function LightboxGallery({ images }: { images: GalleryImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const open = index !== null;

  const close = useCallback(() => setIndex(null), []);
  const next = useCallback(
    () => setIndex((i) => (i === null ? i : (i + 1) % images.length)),
    [images.length],
  );
  const prev = useCallback(
    () => setIndex((i) => (i === null ? i : (i - 1 + images.length) % images.length)),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') next();
      if (e.key === 'ArrowLeft') prev();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, close, next, prev]);

  const active = index !== null ? images[index] : null;
  const activeSrc = active ? mediaSrc(active.media, 'large') : null;

  return (
    <>
      <div className="columns-2 gap-3 md:columns-3 lg:columns-4 [&>*]:mb-3">
        {images.map((image, i) => {
          const src = mediaSrc(image.media, 'medium');
          if (!src) return null;
          return (
            <button
              key={image.id}
              type="button"
              onClick={() => setIndex(i)}
              className="group block w-full overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)]"
            >
              <Image
                src={src}
                alt={image.caption ?? 'Gallery image'}
                width={image.media.width ?? 600}
                height={image.media.height ?? 400}
                sizes="(max-width: 768px) 50vw, 25vw"
                className="h-auto w-full transition-transform duration-500 group-hover:scale-105"
              />
            </button>
          );
        })}
      </div>

      {open && active && activeSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Image viewer"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
          onClick={close}
        >
          <button
            type="button"
            aria-label="Close"
            onClick={close}
            className="absolute right-5 top-5 text-2xl text-white/70 hover:text-white"
          >
            ✕
          </button>
          <button
            type="button"
            aria-label="Previous"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className="absolute left-4 text-3xl text-white/60 hover:text-white md:left-10"
          >
            ‹
          </button>
          <figure className="max-h-[85vh] max-w-5xl" onClick={(e) => e.stopPropagation()}>
            <Image
              src={activeSrc}
              alt={active.caption ?? 'Gallery image'}
              width={active.media.width ?? 1200}
              height={active.media.height ?? 800}
              className="max-h-[80vh] w-auto rounded-lg object-contain"
            />
            {active.caption && (
              <figcaption className="mt-3 text-center text-sm text-white/70">
                {active.caption}
              </figcaption>
            )}
          </figure>
          <button
            type="button"
            aria-label="Next"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className="absolute right-4 text-3xl text-white/60 hover:text-white md:right-10"
          >
            ›
          </button>
        </div>
      )}
    </>
  );
}

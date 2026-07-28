import { MediaLibrary } from './media-library';

/** Media library page. */
export default function MediaPage() {
  return (
    <div>
      <h1 className="font-[var(--font-heading)] text-2xl font-bold">Media</h1>
      <p className="mb-6 mt-1 text-sm text-[var(--text-secondary)]">
        Upload and manage images and documents used across the site.
      </p>
      <MediaLibrary />
    </div>
  );
}

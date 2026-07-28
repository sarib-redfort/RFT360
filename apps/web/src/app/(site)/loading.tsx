/**
 * Route-level loading state for the public site — a brand-coloured pulse so
 * navigation never shows a blank frame while a server component streams.
 */
export default function SiteLoading() {
  return (
    <div className="flex min-h-[70vh] items-center justify-center bg-[var(--bg-dark)]">
      <div className="flex flex-col items-center gap-4" role="status" aria-label="Loading">
        <span className="relative flex h-10 w-10">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--accent)] opacity-40" />
          <span className="relative inline-flex h-10 w-10 rounded-full bg-[var(--accent)] opacity-80" />
        </span>
        <span className="text-[0.7rem] font-bold uppercase tracking-[3px] text-[var(--text-muted)]">
          Loading
        </span>
      </div>
    </div>
  );
}

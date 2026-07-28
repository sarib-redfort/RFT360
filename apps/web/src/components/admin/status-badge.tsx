import { cn } from '@/lib/utils';

const styles: Record<string, string> = {
  PUBLISHED: 'bg-emerald-100 text-emerald-700',
  DRAFT: 'bg-amber-100 text-amber-700',
  ARCHIVED: 'bg-gray-200 text-gray-600',
  NEW: 'bg-blue-100 text-blue-700',
  READ: 'bg-gray-100 text-gray-600',
  REPLIED: 'bg-emerald-100 text-emerald-700',
  REVIEWING: 'bg-amber-100 text-amber-700',
  SHORTLISTED: 'bg-violet-100 text-violet-700',
  INTERVIEWING: 'bg-blue-100 text-blue-700',
  HIRED: 'bg-emerald-100 text-emerald-700',
  REJECTED: 'bg-red-100 text-red-700',
};

/** Small coloured pill for a content/pipeline status value. */
export function StatusBadge({ status }: { status: string }) {
  return (
    <span
      className={cn(
        'inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold',
        styles[status] ?? 'bg-gray-100 text-gray-600',
      )}
    >
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </span>
  );
}

'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { toast } from 'sonner';
import { deleteResource, setStatus } from '@/app/admin/actions';

/** Per-row actions in a resource list: edit, publish/unpublish, delete. */
export function ResourceRowActions({
  path,
  resourceKey,
  id,
  status,
  publishable,
}: {
  path: string;
  resourceKey: string;
  id: string;
  status?: string;
  publishable?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const act = (fn: () => Promise<{ ok: boolean; error?: string }>, success: string) =>
    startTransition(async () => {
      const result = await fn();
      if (result.ok) {
        toast.success(success);
        router.refresh();
      } else {
        toast.error(result.error ?? 'Something went wrong');
      }
    });

  return (
    <div className="flex items-center justify-end gap-1">
      {publishable &&
        (status === 'PUBLISHED' ? (
          <IconButton
            title="Unpublish"
            icon="fa-solid fa-eye-slash"
            disabled={pending}
            onClick={() => act(() => setStatus(path, id, 'unpublish'), 'Moved to draft')}
          />
        ) : (
          <IconButton
            title="Publish"
            icon="fa-solid fa-cloud-arrow-up"
            disabled={pending}
            onClick={() => act(() => setStatus(path, id, 'publish'), 'Published')}
          />
        ))}
      <Link
        href={`/admin/${resourceKey}/${id}`}
        title="Edit"
        className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]"
      >
        <i className="fa-solid fa-pen text-xs" aria-hidden />
      </Link>
      <IconButton
        title="Delete"
        icon="fa-solid fa-trash"
        danger
        disabled={pending}
        onClick={() => {
          if (confirm('Delete this item? This cannot be undone.')) {
            act(() => deleteResource(path, id), 'Deleted');
          }
        }}
      />
    </div>
  );
}

function IconButton({
  title,
  icon,
  onClick,
  disabled,
  danger,
}: {
  title: string;
  icon: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      onClick={onClick}
      disabled={disabled}
      className={`flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card-hover)] disabled:opacity-40 ${
        danger ? 'hover:text-red-600' : 'hover:text-[var(--accent)]'
      }`}
    >
      <i className={`${icon} text-xs`} aria-hidden />
    </button>
  );
}

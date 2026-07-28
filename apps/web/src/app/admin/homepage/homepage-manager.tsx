'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { saveResource, reorderResource } from '@/app/admin/actions';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Section {
  id: string;
  type: string;
  name: string;
  eyebrow?: string | null;
  heading?: string | null;
  headingAccent?: string | null;
  subheading?: string | null;
  itemLimit: number;
  isVisible: boolean;
  order: number;
}

/**
 * Homepage manager: reorder sections (drag), toggle visibility, and edit the
 * copy of each. The section *type* is fixed (it determines which content the
 * section pulls); editors control ordering, visibility and wording.
 */
export function HomepageManager({ initial }: { initial: Section[] }) {
  const router = useRouter();
  const [sections, setSections] = useState(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setSections((cur) => {
      const oldIndex = cur.findIndex((s) => s.id === active.id);
      const newIndex = cur.findIndex((s) => s.id === over.id);
      const next = arrayMove(cur, oldIndex, newIndex);
      startTransition(async () => {
        const result = await reorderResource(
          'homepage-sections',
          next.map((s, i) => ({ id: s.id, order: i })),
        );
        if (result.ok) toast.success('Order saved');
        else toast.error(result.error);
      });
      return next;
    });
  };

  const patch = (id: string, data: Partial<Section>) =>
    startTransition(async () => {
      const result = await saveResource('homepage-sections', id, data);
      if (result.ok) {
        setSections((cur) => cur.map((s) => (s.id === id ? { ...s, ...data } : s)));
        toast.success('Saved');
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-3">
          {sections.map((section) => (
            <SectionRow
              key={section.id}
              section={section}
              editing={editing === section.id}
              onToggleEdit={() => setEditing(editing === section.id ? null : section.id)}
              onToggleVisible={() => patch(section.id, { isVisible: !section.isVisible })}
              onSave={(data) => {
                patch(section.id, data);
                setEditing(null);
              }}
              pending={pending}
            />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}

function SectionRow({
  section,
  editing,
  onToggleEdit,
  onToggleVisible,
  onSave,
  pending,
}: {
  section: Section;
  editing: boolean;
  onToggleEdit: () => void;
  onToggleVisible: () => void;
  onSave: (data: Partial<Section>) => void;
  pending: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: section.id });
  const [draft, setDraft] = useState(section);
  const input = 'w-full rounded-lg border border-[var(--border)] bg-[var(--bg-surface)] px-3 py-2 text-sm';

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] ${isDragging ? 'opacity-60 shadow-lg' : ''}`}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        <button
          type="button"
          className="cursor-grab text-[var(--text-muted)] active:cursor-grabbing"
          aria-label="Drag"
          {...attributes}
          {...listeners}
        >
          <i className="fa-solid fa-grip-vertical" aria-hidden />
        </button>
        <div className="min-w-0 flex-1">
          <p className="font-medium text-[var(--text-primary)]">{section.name}</p>
          <p className="text-xs text-[var(--text-muted)]">{section.type}</p>
        </div>
        <button
          type="button"
          onClick={onToggleVisible}
          disabled={pending}
          title={section.isVisible ? 'Visible' : 'Hidden'}
          className={`flex h-8 w-8 items-center justify-center rounded-lg ${
            section.isVisible ? 'text-emerald-600' : 'text-[var(--text-muted)]'
          }`}
        >
          <i className={section.isVisible ? 'fa-solid fa-eye' : 'fa-solid fa-eye-slash'} aria-hidden />
        </button>
        <button
          type="button"
          onClick={onToggleEdit}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)]"
          aria-label="Edit copy"
        >
          <i className="fa-solid fa-pen text-xs" aria-hidden />
        </button>
      </div>

      {editing && (
        <div className="grid gap-3 border-t border-[var(--border)] p-4 sm:grid-cols-2">
          <Labeled label="Eyebrow">
            <input className={input} value={draft.eyebrow ?? ''} onChange={(e) => setDraft({ ...draft, eyebrow: e.target.value })} />
          </Labeled>
          <Labeled label="Item limit">
            <input type="number" className={input} value={draft.itemLimit} onChange={(e) => setDraft({ ...draft, itemLimit: Number(e.target.value) })} />
          </Labeled>
          <Labeled label="Heading">
            <input className={input} value={draft.heading ?? ''} onChange={(e) => setDraft({ ...draft, heading: e.target.value })} />
          </Labeled>
          <Labeled label="Heading accent (red)">
            <input className={input} value={draft.headingAccent ?? ''} onChange={(e) => setDraft({ ...draft, headingAccent: e.target.value })} />
          </Labeled>
          <Labeled label="Subheading" full>
            <textarea rows={2} className={`${input} resize-y`} value={draft.subheading ?? ''} onChange={(e) => setDraft({ ...draft, subheading: e.target.value })} />
          </Labeled>
          <div className="sm:col-span-2">
            <button
              type="button"
              onClick={() =>
                onSave({
                  eyebrow: draft.eyebrow,
                  heading: draft.heading,
                  headingAccent: draft.headingAccent,
                  subheading: draft.subheading,
                  itemLimit: draft.itemLimit,
                })
              }
              disabled={pending}
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50"
            >
              Save section
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

function Labeled({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? 'sm:col-span-2' : ''}>
      <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">{label}</label>
      {children}
    </div>
  );
}

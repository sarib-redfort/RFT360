'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { reorderResource } from '@/app/admin/actions';

interface Item {
  id: string;
  label: string;
}

/** Keyboard- and pointer-accessible drag list that persists the new order. */
export function SortableList({ path, resourceKey, initial }: { path: string; resourceKey: string; initial: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState(initial);
  const [pending, startTransition] = useTransition();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const onDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    setItems((current) => {
      const oldIndex = current.findIndex((i) => i.id === active.id);
      const newIndex = current.findIndex((i) => i.id === over.id);
      return arrayMove(current, oldIndex, newIndex);
    });
  };

  const save = () =>
    startTransition(async () => {
      const payload = items.map((item, index) => ({ id: item.id, order: index }));
      const result = await reorderResource(path, payload);
      if (result.ok) {
        toast.success('Order saved');
        router.push(`/admin/${resourceKey}`);
        router.refresh();
      } else {
        toast.error(result.error);
      }
    });

  return (
    <div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-2">
            {items.map((item) => (
              <SortableRow key={item.id} id={item.id} label={item.label} />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <button
        type="button"
        onClick={save}
        disabled={pending}
        className="mt-6 rounded-lg bg-[var(--accent)] px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
      >
        {pending ? 'Saving…' : 'Save order'}
      </button>
    </div>
  );
}

function SortableRow({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3 ${
        isDragging ? 'opacity-60 shadow-lg' : ''
      }`}
    >
      <button
        type="button"
        className="cursor-grab text-[var(--text-muted)] active:cursor-grabbing"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <i className="fa-solid fa-grip-vertical" aria-hidden />
      </button>
      <span className="text-sm font-medium text-[var(--text-primary)]">{label}</span>
    </li>
  );
}

"use client";

import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SortableListProps<T extends { id: string }> {
  items: T[];
  onReorder: (items: T[]) => void; // called with new local order immediately (optimistic)
  renderItem: (item: T, dragHandle: ReactNode) => ReactNode;
}

export function SortableList<T extends { id: string }>({
  items,
  onReorder,
  renderItem,
}: SortableListProps<T>) {
  const [localItems, setLocalItems] = useState(items);
  useEffect(() => {
    // Re-sync local order when the parent's item list changes (e.g. after
    // a server refresh) without fighting in-progress local drag state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLocalItems(items);
  }, [items]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } })
  );

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = localItems.findIndex((i) => i.id === active.id);
    const newIndex = localItems.findIndex((i) => i.id === over.id);
    const reordered = arrayMove(localItems, oldIndex, newIndex);
    setLocalItems(reordered);
    onReorder(reordered);
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext
        items={localItems.map((i) => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="flex flex-col gap-2">
          {localItems.map((item) => (
            <SortableRow key={item.id} id={item.id}>
              {(handle) => renderItem(item, handle)}
            </SortableRow>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableRow({
  id,
  children,
}: {
  id: string;
  children: (dragHandle: ReactNode) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handle = (
    <button
      type="button"
      className="cursor-grab touch-none text-ink-faint hover:text-ink-soft active:cursor-grabbing"
      {...attributes}
      {...listeners}
      aria-label="Drag to reorder"
    >
      <GripVertical size={16} />
    </button>
  );

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(isDragging && "z-10 opacity-90 shadow-lg")}
    >
      {children(handle)}
    </div>
  );
}

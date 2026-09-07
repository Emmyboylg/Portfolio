"use client";

import { useState, useTransition } from "react";
import { Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { SortableList } from "@/components/ui/SortableList";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Plus, Trash2 } from "lucide-react";

interface LabeledItem {
  id: string;
  label: string;
}

interface LabelListEditorProps<T extends LabeledItem> {
  items: T[];
  placeholder: string;
  onAdd: (label: string) => Promise<T | null>;
  onRename: (id: string, label: string) => void;
  onDelete: (id: string) => Promise<void>;
  onReorder: (orderedIds: string[]) => void;
}

export function LabelListEditor<T extends LabeledItem>({
  items,
  placeholder,
  onAdd,
  onRename,
  onDelete,
  onReorder,
}: LabelListEditorProps<T>) {
  const [localItems, setLocalItems] = useState(items);
  const [draft, setDraft] = useState("");
  const [adding, startAdding] = useTransition();

  async function handleAdd() {
    const label = draft.trim();
    if (!label) return;
    setDraft("");
    startAdding(async () => {
      const created = await onAdd(label);
      if (created) setLocalItems((prev) => [...prev, created]);
    });
  }

  return (
    <div>
      <div className="flex gap-2">
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={placeholder}
        />
        <Button onClick={handleAdd} disabled={adding || !draft.trim()}>
          <Plus size={14} />
          Add
        </Button>
      </div>

      {localItems.length > 0 && (
        <div className="mt-3">
          <SortableList
            items={localItems}
            onReorder={(reordered) => {
              setLocalItems(reordered);
              onReorder(reordered.map((i) => i.id));
            }}
            renderItem={(item, handle) => (
              <div className="flex items-center gap-2 rounded-md border border-line bg-surface px-2 py-1.5">
                {handle}
                <Input
                  value={item.label}
                  onChange={(e) => {
                    const value = e.target.value;
                    setLocalItems((prev) =>
                      prev.map((i) => (i.id === item.id ? { ...i, label: value } : i))
                    );
                  }}
                  onBlur={(e) => onRename(item.id, e.target.value)}
                  className="border-none px-1 py-0.5 focus:ring-0"
                />
                <ConfirmDialog
                  title={`Remove "${item.label}"?`}
                  description="This can't be undone."
                  trigger={(open) => (
                    <button onClick={open} className="text-ink-faint hover:text-danger">
                      <Trash2 size={14} />
                    </button>
                  )}
                  onConfirm={async () => {
                    await onDelete(item.id);
                    setLocalItems((prev) => prev.filter((i) => i.id !== item.id));
                  }}
                />
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}

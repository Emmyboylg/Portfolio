"use client";

import { useState, useTransition } from "react";
import type { Experience } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { SortableList } from "@/components/ui/SortableList";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  reorderExperience,
  type ExperienceInput,
} from "./actions";
import { Plus, Trash2, X } from "lucide-react";

export function ExperienceClient({ initialItems }: { initialItems: Experience[] }) {
  const [items, setItems] = useState(initialItems);
  const [editing, setEditing] = useState<Experience | "new" | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div>
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setEditing("new")}>
          <Plus size={14} />
          Add role
        </Button>
      </div>

      {items.length === 0 ? (
        <p className="mt-8 text-sm text-ink-faint">No experience entries yet.</p>
      ) : (
        <div className="mt-4">
          <SortableList
            items={items}
            onReorder={(reordered) => {
              setItems(reordered);
              startTransition(() => {
                reorderExperience(reordered.map((i) => i.id));
              });
            }}
            renderItem={(item, handle) => (
              <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3">
                {handle}
                <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(item)}>
                  <div className="font-medium text-ink hover:text-accent">
                    {item.role} · {item.company}
                  </div>
                  <div className="text-xs text-ink-faint">
                    {item.start_date ?? "—"} – {item.end_date ?? "Present"}
                  </div>
                </button>
                <ConfirmDialog
                  title={`Remove "${item.role}" at "${item.company}"?`}
                  description="This can't be undone."
                  trigger={(open) => (
                    <button onClick={open} className="rounded p-2 text-ink-faint hover:bg-danger-soft hover:text-danger">
                      <Trash2 size={15} />
                    </button>
                  )}
                  onConfirm={async () => {
                    const res = await deleteExperience(item.id);
                    if (res.success) setItems((prev) => prev.filter((i) => i.id !== item.id));
                  }}
                />
              </div>
            )}
          />
        </div>
      )}

      {editing && (
        <ExperienceModal
          item={editing === "new" ? null : editing}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setItems((prev) => {
              const exists = prev.some((i) => i.id === saved.id);
              return exists ? prev.map((i) => (i.id === saved.id ? saved : i)) : [...prev, saved];
            });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function ExperienceModal({
  item,
  onClose,
  onSaved,
}: {
  item: Experience | null;
  onClose: () => void;
  onSaved: (item: Experience) => void;
}) {
  const [company, setCompany] = useState(item?.company ?? "");
  const [role, setRole] = useState(item?.role ?? "");
  const [startDate, setStartDate] = useState(item?.start_date ?? "");
  const [endDate, setEndDate] = useState(item?.end_date ?? "");
  const [description, setDescription] = useState(item?.description ?? "");
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startSaving(async () => {
      const input: ExperienceInput = {
        company,
        role,
        start_date: startDate || null,
        end_date: endDate || null,
        description,
      };
      const result = item ? await updateExperience(item.id, input) : await createExperience(input);
      if (result.error) setError(result.error);
      else if (result.data) onSaved(result.data);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-lg bg-surface p-5 shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">{item ? "Edit role" : "Add role"}</h3>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          <Field label="Company">
            <Input value={company} onChange={(e) => setCompany(e.target.value)} />
          </Field>
          <Field label="Role">
            <Input value={role} onChange={(e) => setRole(e.target.value)} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Start date">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </Field>
            <Field label="End date" hint="Leave blank if current">
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </Field>
          </div>
          <Field label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
          </Field>

          {error && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={save} disabled={saving || !company || !role}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

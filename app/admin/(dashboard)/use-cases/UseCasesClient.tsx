"use client";

import { useState, useTransition } from "react";
import type { UseCase, Project } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GalleryField } from "@/components/admin/GalleryField";
import { TagInput } from "@/components/admin/TagInput";
import { SortableList } from "@/components/ui/SortableList";
import { slugify } from "@/lib/utils";
import {
  createUseCase,
  updateUseCase,
  deleteUseCase,
  toggleUseCaseStatus,
  reorderUseCases,
  type UseCaseInput,
} from "./actions";
import { Plus, Trash2, X } from "lucide-react";

interface UseCaseWithImages extends UseCase {
  images?: { id: string; storage_path: string }[];
}

export function UseCasesClient({
  initialUseCases,
  projects,
}: {
  initialUseCases: UseCaseWithImages[];
  projects: Project[];
}) {
  const [useCases, setUseCases] = useState(initialUseCases);
  const [editing, setEditing] = useState<UseCaseWithImages | "new" | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div>
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setEditing("new")}>
          <Plus size={14} />
          Add use case
        </Button>
      </div>

      {useCases.length === 0 ? (
        <p className="mt-8 text-sm text-ink-faint">No use cases yet.</p>
      ) : (
        <div className="mt-4">
          <SortableList
            items={useCases}
            onReorder={(reordered) => {
              setUseCases(reordered);
              startTransition(() => {
                reorderUseCases(reordered.map((u) => u.id));
              });
            }}
            renderItem={(uc, handle) => (
              <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3">
                {handle}
                <button className="min-w-0 flex-1 text-left" onClick={() => setEditing(uc)}>
                  <div className="truncate font-medium text-ink hover:text-accent">{uc.title}</div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <StatusBadge status={uc.status} />
                    <span className="text-xs text-ink-faint">{uc.short_description}</span>
                  </div>
                </button>
                <Button
                  size="sm"
                  variant={uc.status === "published" ? "secondary" : "primary"}
                  onClick={() =>
                    startTransition(async () => {
                      const res = await toggleUseCaseStatus(uc.id);
                      if ("status" in res) {
                        setUseCases((prev) =>
                          prev.map((u) => (u.id === uc.id ? { ...u, status: res.status! } : u))
                        );
                      }
                    })
                  }
                >
                  {uc.status === "published" ? "Unpublish" : "Publish"}
                </Button>
                <ConfirmDialog
                  title={`Delete "${uc.title}"?`}
                  description="This can't be undone."
                  trigger={(open) => (
                    <button onClick={open} className="rounded p-2 text-ink-faint hover:bg-danger-soft hover:text-danger">
                      <Trash2 size={15} />
                    </button>
                  )}
                  onConfirm={async () => {
                    const res = await deleteUseCase(uc.id);
                    if (res.success) setUseCases((prev) => prev.filter((u) => u.id !== uc.id));
                  }}
                />
              </div>
            )}
          />
        </div>
      )}

      {editing && (
        <UseCaseModal
          useCase={editing === "new" ? null : editing}
          projects={projects}
          onClose={() => setEditing(null)}
          onSaved={(saved) => {
            setUseCases((prev) => {
              const exists = prev.some((u) => u.id === saved.id);
              return exists
                ? prev.map((u) => (u.id === saved.id ? { ...u, ...saved } : u))
                : [...prev, saved as UseCaseWithImages];
            });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function UseCaseModal({
  useCase,
  projects,
  onClose,
  onSaved,
}: {
  useCase: UseCaseWithImages | null;
  projects: Project[];
  onClose: () => void;
  onSaved: (uc: UseCase) => void;
}) {
  const [title, setTitle] = useState(useCase?.title ?? "");
  const [slug, setSlug] = useState(useCase?.slug ?? "");
  const [shortDescription, setShortDescription] = useState(useCase?.short_description ?? "");
  const [problem, setProblem] = useState(useCase?.problem ?? "");
  const [solution, setSolution] = useState(useCase?.solution ?? "");
  const [projectId, setProjectId] = useState(useCase?.related_project_id ?? "");
  const [tags, setTags] = useState<string[]>(useCase?.tags ?? []);
  const [images, setImages] = useState(useCase?.images ?? []);
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startSaving(async () => {
      const input: UseCaseInput = {
        title,
        slug: slug || slugify(title),
        short_description: shortDescription,
        problem,
        solution,
        related_project_id: projectId || null,
        tags,
        seo_title: "",
        seo_description: "",
        image_media_ids: images.map((i) => i.id),
      };
      const result = useCase ? await updateUseCase(useCase.id, input) : await createUseCase(input);
      if (result.error) setError(result.error);
      else if (result.data) onSaved(result.data);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">{useCase ? "Edit use case" : "Add use case"}</h3>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Title" required>
            <Input
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!useCase) setSlug(slugify(e.target.value));
              }}
            />
          </Field>
          <Field label="Slug">
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </Field>
          <Field label="Short description">
            <Textarea value={shortDescription} onChange={(e) => setShortDescription(e.target.value)} rows={2} />
          </Field>
          <Field label="Problem">
            <Textarea value={problem} onChange={(e) => setProblem(e.target.value)} rows={3} />
          </Field>
          <Field label="Solution">
            <Textarea value={solution} onChange={(e) => setSolution(e.target.value)} rows={3} />
          </Field>
          <Field label="Related project">
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <TagInput label="Tags" value={tags} onChange={setTags} />
          <GalleryField label="Images" value={images} onChange={setImages} />

          {error && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={save} disabled={saving || !title}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

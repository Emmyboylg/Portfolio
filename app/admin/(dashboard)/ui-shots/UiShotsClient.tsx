"use client";

import { useState, useTransition } from "react";
import type { UiShot, Project } from "@/types/database";
import { mediaUrl } from "@/lib/media-url";
import { Button } from "@/components/ui/Button";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { GalleryField } from "@/components/admin/GalleryField";
import { TagInput } from "@/components/admin/TagInput";
import { SortableList } from "@/components/ui/SortableList";
import {
  createUiShot,
  updateUiShot,
  deleteUiShot,
  toggleUiShotStatus,
  reorderUiShots,
  type UiShotInput,
} from "./actions";
import { Plus, Trash2, X } from "lucide-react";

interface GalleryImage {
  id: string;
  storage_path: string;
}

interface ShotWithImages extends UiShot {
  images?: GalleryImage[];
}

export function UiShotsClient({
  initialShots,
  projects,
}: {
  initialShots: ShotWithImages[];
  projects: Project[];
}) {
  const [shots, setShots] = useState(initialShots);
  const [editing, setEditing] = useState<ShotWithImages | "new" | null>(null);
  const [, startTransition] = useTransition();

  return (
    <div>
      <div className="flex justify-end">
        <Button variant="primary" size="sm" onClick={() => setEditing("new")}>
          <Plus size={14} />
          Add UI shot
        </Button>
      </div>

      {shots.length === 0 ? (
        <p className="mt-8 text-sm text-ink-faint">No UI shots yet.</p>
      ) : (
        <div className="mt-4">
          <SortableList
            items={shots}
            onReorder={(reordered) => {
              setShots(reordered);
              startTransition(() => {
                reorderUiShots(reordered.map((s) => s.id));
              });
            }}
            renderItem={(shot, handle) => {
              const cover = shot.images?.[0];
              return (
                <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3">
                  {handle}
                  <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded bg-paper">
                    {cover && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={mediaUrl(cover.storage_path) ?? ""} alt="" className="h-full w-full object-cover" />
                    )}
                    {(shot.images?.length ?? 0) > 1 && (
                      <span className="absolute bottom-0.5 right-0.5 rounded bg-ink/70 px-1 text-[10px] text-white">
                        +{(shot.images?.length ?? 1) - 1}
                      </span>
                    )}
                  </div>
                  <button
                    className="min-w-0 flex-1 text-left"
                    onClick={() => setEditing(shot)}
                  >
                    <div className="truncate font-medium text-ink hover:text-accent">{shot.title}</div>
                    <div className="mt-0.5 flex items-center gap-2">
                      <StatusBadge status={shot.status} />
                      {shot.tags.slice(0, 3).map((t) => (
                        <span key={t} className="text-xs text-ink-faint">#{t}</span>
                      ))}
                    </div>
                  </button>
                  <Button
                    size="sm"
                    variant={shot.status === "published" ? "secondary" : "primary"}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await toggleUiShotStatus(shot.id);
                        if ("status" in res) {
                          setShots((prev) =>
                            prev.map((s) => (s.id === shot.id ? { ...s, status: res.status! } : s))
                          );
                        }
                      })
                    }
                  >
                    {shot.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <ConfirmDialog
                    title={`Delete "${shot.title}"?`}
                    description="This can't be undone."
                    trigger={(open) => (
                      <button onClick={open} className="rounded p-2 text-ink-faint hover:bg-danger-soft hover:text-danger">
                        <Trash2 size={15} />
                      </button>
                    )}
                    onConfirm={async () => {
                      const res = await deleteUiShot(shot.id);
                      if (res.success) setShots((prev) => prev.filter((s) => s.id !== shot.id));
                    }}
                  />
                </div>
              );
            }}
          />
        </div>
      )}

      {editing && (
        <UiShotModal
          shot={editing === "new" ? null : editing}
          projects={projects}
          onClose={() => setEditing(null)}
          onSaved={(saved, images) => {
            setShots((prev) => {
              const exists = prev.some((s) => s.id === saved.id);
              const withImages = { ...saved, images };
              return exists
                ? prev.map((s) => (s.id === saved.id ? { ...s, ...withImages } : s))
                : [...prev, withImages as ShotWithImages];
            });
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}

function UiShotModal({
  shot,
  projects,
  onClose,
  onSaved,
}: {
  shot: ShotWithImages | null;
  projects: Project[];
  onClose: () => void;
  onSaved: (shot: UiShot, images: GalleryImage[]) => void;
}) {
  const [title, setTitle] = useState(shot?.title ?? "");
  const [description, setDescription] = useState(shot?.description ?? "");
  const [projectId, setProjectId] = useState(shot?.project_id ?? "");
  const [images, setImages] = useState<GalleryImage[]>(shot?.images ?? []);
  const [tags, setTags] = useState<string[]>(shot?.tags ?? []);
  const [tools, setTools] = useState<string[]>(shot?.tools ?? []);
  const [featured, setFeatured] = useState(shot?.featured ?? false);
  const [saving, startSaving] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startSaving(async () => {
      const input: UiShotInput = {
        title,
        description,
        project_id: projectId || null,
        tags,
        tools,
        featured,
        image_media_ids: images.map((i) => i.id),
      };
      const result = shot ? await updateUiShot(shot.id, input) : await createUiShot(input);
      if (result.error) setError(result.error);
      else if (result.data) onSaved(result.data, images);
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4" onClick={onClose}>
      <div
        className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-surface p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg text-ink">{shot ? "Edit UI shot" : "Add UI shot"}</h3>
          <button onClick={onClose} className="text-ink-faint hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <Field label="Title" required>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </Field>
          <Field label="Description">
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
          </Field>
          <Field label="Project" hint="Optional — leave blank for a standalone shot not tied to a project.">
            <Select value={projectId} onChange={(e) => setProjectId(e.target.value)}>
              <option value="">None</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </Select>
          </Field>
          <GalleryField
            label="Images"
            value={images}
            onChange={setImages}
          />
          <TagInput label="Tools used" value={tools} onChange={setTools} placeholder="Figma, Framer…" />
          <TagInput label="Tags" value={tags} onChange={setTags} placeholder="Dashboard, Campaigns…" />
          <label className="flex items-center gap-2 text-sm text-ink">
            <input
              type="checkbox"
              checked={featured}
              onChange={(e) => setFeatured(e.target.checked)}
              className="h-4 w-4 rounded border-line-strong text-accent focus:ring-accent/40"
            />
            Featured
          </label>

          {error && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={save} disabled={saving || !title || images.length === 0}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

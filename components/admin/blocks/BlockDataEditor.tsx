"use client";

import { useEffect, useState } from "react";
import type { CaseStudySection } from "@/types/database";
import { updateBlockData } from "@/app/admin/(dashboard)/case-studies/actions";
import { Input, Textarea, Select, Field } from "@/components/ui/Field";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { Button } from "@/components/ui/Button";
import type { Media } from "@/types/database";
import { Plus, X } from "lucide-react";
import { mediaUrl } from "@/lib/media-url";

interface BlockDataEditorProps {
  block: CaseStudySection;
  mediaLookup: Map<string, Media>;
}

// Generic control for arrays of small objects (statistics, process steps,
// timeline items) — renders one row per item with the given fields.
function RepeatingRows<T extends Record<string, string>>({
  items,
  fields,
  onChange,
  addLabel,
}: {
  items: T[];
  fields: { key: keyof T; placeholder: string }[];
  onChange: (items: T[]) => void;
  addLabel: string;
}) {
  return (
    <div className="space-y-2">
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-2">
          {fields.map((f) => (
            <Input
              key={String(f.key)}
              value={item[f.key] ?? ""}
              placeholder={f.placeholder}
              onChange={(e) => {
                const next = [...items];
                next[i] = { ...next[i], [f.key]: e.target.value };
                onChange(next);
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="shrink-0 text-ink-faint hover:text-danger"
          >
            <X size={15} />
          </button>
        </div>
      ))}
      <Button
        type="button"
        size="sm"
        onClick={() =>
          onChange([
            ...items,
            Object.fromEntries(fields.map((f) => [f.key, ""])) as T,
          ])
        }
      >
        <Plus size={13} />
        {addLabel}
      </Button>
    </div>
  );
}

export function BlockDataEditor({ block, mediaLookup }: BlockDataEditorProps) {
  const [data, setData] = useState<Record<string, unknown>>(block.data);
  const [dirty, setDirty] = useState(false);

  useEffect(() => {
    // Re-sync local editor state whenever the selected block changes
    // (switching blocks, or an external update to this block's data).
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setData(block.data);
    setDirty(false);
  }, [block.id, block.data]);

  function update(patch: Record<string, unknown>) {
    setData((prev) => ({ ...prev, ...patch }));
    setDirty(true);
  }

  function save(nextData: Record<string, unknown> = data) {
    updateBlockData(block.id, nextData);
    setDirty(false);
  }

  function mediaFor(id: unknown): Media | null {
    if (typeof id !== "string") return null;
    return mediaLookup.get(id) ?? null;
  }

  const commonBlurProps = { onBlur: () => dirty && save() };

  switch (block.block_type) {
    case "heading":
      return (
        <div className="space-y-3">
          <Field label="Text">
            <Input
              value={(data.text as string) ?? ""}
              onChange={(e) => update({ text: e.target.value })}
              {...commonBlurProps}
            />
          </Field>
          <Field label="Level">
            <Select
              value={String(data.level ?? 2)}
              onChange={(e) => save({ ...data, level: Number(e.target.value) })}
            >
              <option value="1">Heading 1</option>
              <option value="2">Heading 2</option>
              <option value="3">Heading 3</option>
            </Select>
          </Field>
        </div>
      );

    case "paragraph":
      return (
        <Textarea
          value={(data.text as string) ?? ""}
          onChange={(e) => update({ text: e.target.value })}
          {...commonBlurProps}
          rows={4}
        />
      );

    case "image":
    case "full_width_image":
      return (
        <div className="space-y-3">
          <MediaPicker
            label="Image"
            value={mediaFor(data.media_id)}
            onChange={(m) => save({ ...data, media_id: m?.id ?? null })}
          />
          <Field label="Caption">
            <Input
              value={(data.caption as string) ?? ""}
              onChange={(e) => update({ caption: e.target.value })}
              {...commonBlurProps}
            />
          </Field>
        </div>
      );

    case "image_gallery": {
      const ids = (data.media_ids as string[]) ?? [];
      return (
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {ids.map((id) => {
              const m = mediaLookup.get(id);
              return (
                <div key={id} className="relative h-16 w-24 overflow-hidden rounded border border-line bg-paper">
                  {m && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={mediaUrl(m.storage_path) ?? ""} alt="" className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => save({ ...data, media_ids: ids.filter((i) => i !== id) })}
                    className="absolute right-0.5 top-0.5 rounded-full bg-ink/60 p-0.5 text-white"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
          </div>
          <MediaPicker
            label="Add image"
            value={null}
            onChange={(m) => m && save({ ...data, media_ids: [...ids, m.id] })}
          />
        </div>
      );
    }

    case "video":
      return (
        <div className="space-y-3">
          <MediaPicker
            label="Uploaded video"
            value={mediaFor(data.media_id)}
            onChange={(m) => save({ ...data, media_id: m?.id ?? null })}
          />
          <Field label="Or embed URL" hint="YouTube / Vimeo link — used if no video is uploaded above.">
            <Input
              value={(data.embed_url as string) ?? ""}
              onChange={(e) => update({ embed_url: e.target.value })}
              {...commonBlurProps}
            />
          </Field>
          <Field label="Caption">
            <Input
              value={(data.caption as string) ?? ""}
              onChange={(e) => update({ caption: e.target.value })}
              {...commonBlurProps}
            />
          </Field>
        </div>
      );

    case "quote":
      return (
        <div className="space-y-3">
          <Textarea
            value={(data.text as string) ?? ""}
            onChange={(e) => update({ text: e.target.value })}
            {...commonBlurProps}
            rows={3}
            placeholder="Quote text"
          />
          <Input
            value={(data.attribution as string) ?? ""}
            onChange={(e) => update({ attribution: e.target.value })}
            {...commonBlurProps}
            placeholder="Attribution"
          />
        </div>
      );

    case "statistics":
      return (
        <RepeatingRows
          items={(data.items as { label: string; value: string }[]) ?? []}
          fields={[
            { key: "value", placeholder: "-82%" },
            { key: "label", placeholder: "Time to launch" },
          ]}
          onChange={(items) => save({ ...data, items })}
          addLabel="Add stat"
        />
      );

    case "process":
      return (
        <RepeatingRows
          items={(data.steps as { title: string; description: string }[]) ?? []}
          fields={[
            { key: "title", placeholder: "Step title" },
            { key: "description", placeholder: "Description" },
          ]}
          onChange={(steps) => save({ ...data, steps })}
          addLabel="Add step"
        />
      );

    case "timeline":
      return (
        <RepeatingRows
          items={(data.items as { date: string; title: string; description: string }[]) ?? []}
          fields={[
            { key: "date", placeholder: "2025" },
            { key: "title", placeholder: "Milestone" },
            { key: "description", placeholder: "Description" },
          ]}
          onChange={(items) => save({ ...data, items })}
          addLabel="Add milestone"
        />
      );

    case "feature":
      return (
        <div className="space-y-3">
          <Input
            value={(data.title as string) ?? ""}
            onChange={(e) => update({ title: e.target.value })}
            {...commonBlurProps}
            placeholder="Feature title"
          />
          <Textarea
            value={(data.description as string) ?? ""}
            onChange={(e) => update({ description: e.target.value })}
            {...commonBlurProps}
            rows={3}
          />
          <MediaPicker
            label="Image"
            value={mediaFor(data.media_id)}
            onChange={(m) => save({ ...data, media_id: m?.id ?? null })}
          />
        </div>
      );

    case "before_after":
      return (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <MediaPicker
              label="Before"
              value={mediaFor(data.before_media_id)}
              onChange={(m) => save({ ...data, before_media_id: m?.id ?? null })}
            />
            <MediaPicker
              label="After"
              value={mediaFor(data.after_media_id)}
              onChange={(m) => save({ ...data, after_media_id: m?.id ?? null })}
            />
          </div>
          <Input
            value={(data.caption as string) ?? ""}
            onChange={(e) => update({ caption: e.target.value })}
            {...commonBlurProps}
            placeholder="Caption"
          />
        </div>
      );

    case "design_decision":
      return (
        <div className="space-y-3">
          <Input
            value={(data.title as string) ?? ""}
            onChange={(e) => update({ title: e.target.value })}
            {...commonBlurProps}
            placeholder="Decision"
          />
          <Textarea
            value={(data.description as string) ?? ""}
            onChange={(e) => update({ description: e.target.value })}
            {...commonBlurProps}
            rows={3}
            placeholder="Rationale"
          />
        </div>
      );

    case "text_image":
      return (
        <div className="space-y-3">
          <Textarea
            value={(data.text as string) ?? ""}
            onChange={(e) => update({ text: e.target.value })}
            {...commonBlurProps}
            rows={4}
          />
          <MediaPicker
            label="Image"
            value={mediaFor(data.media_id)}
            onChange={(m) => save({ ...data, media_id: m?.id ?? null })}
          />
          <Field label="Image position">
            <Select
              value={(data.image_position as string) ?? "right"}
              onChange={(e) => save({ ...data, image_position: e.target.value })}
            >
              <option value="left">Left</option>
              <option value="right">Right</option>
            </Select>
          </Field>
        </div>
      );

    case "two_column":
      return (
        <div className="grid grid-cols-2 gap-3">
          <Textarea
            value={(data.left as string) ?? ""}
            onChange={(e) => update({ left: e.target.value })}
            {...commonBlurProps}
            rows={4}
            placeholder="Left column"
          />
          <Textarea
            value={(data.right as string) ?? ""}
            onChange={(e) => update({ right: e.target.value })}
            {...commonBlurProps}
            rows={4}
            placeholder="Right column"
          />
        </div>
      );

    default:
      return <p className="text-sm text-ink-faint">Unknown block type.</p>;
  }
}

"use client";

import { useState } from "react";
import type { Media } from "@/types/database";
import { mediaUrl } from "@/lib/media-url";
import { MediaLibraryGrid } from "./MediaLibraryGrid";
import { Button } from "@/components/ui/Button";
import { SortableList } from "@/components/ui/SortableList";
import { X, Plus } from "lucide-react";

interface GalleryImage {
  id: string; // media id, used as the sortable key
  storage_path: string;
}

interface GalleryFieldProps {
  label: string;
  value: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
}

export function GalleryField({ label, value, onChange }: GalleryFieldProps) {
  const [open, setOpen] = useState(false);

  function addImage(media: Media) {
    if (value.some((v) => v.id === media.id)) {
      setOpen(false);
      return;
    }
    onChange([...value, { id: media.id, storage_path: media.storage_path }]);
    setOpen(false);
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>

      {value.length === 0 ? (
        <p className="mb-2 text-xs text-ink-faint">No images added yet.</p>
      ) : (
        <SortableList
          items={value}
          onReorder={onChange}
          renderItem={(img, handle) => (
            <div className="flex items-center gap-3 rounded-md border border-line bg-surface px-2 py-2">
              {handle}
              <div className="h-12 w-16 overflow-hidden rounded bg-paper">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(img.storage_path) ?? ""}
                  alt=""
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex-1" />
              <button
                type="button"
                onClick={() => onChange(value.filter((v) => v.id !== img.id))}
                className="text-ink-faint hover:text-danger"
              >
                <X size={15} />
              </button>
            </div>
          )}
        />
      )}

      <Button type="button" size="sm" className="mt-2" onClick={() => setOpen(true)}>
        <Plus size={14} />
        Add image
      </Button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-3xl overflow-y-auto rounded-lg bg-surface p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center justify-between">
              <h3 className="font-display text-lg text-ink">Add to gallery</h3>
              <button onClick={() => setOpen(false)} className="text-ink-faint hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <MediaLibraryGrid onSelect={addImage} selectMode selectedId={null} />
          </div>
        </div>
      )}
    </div>
  );
}

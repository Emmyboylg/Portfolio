"use client";

import { useState } from "react";
import { mediaUrl } from "@/lib/media-url";
import { Button } from "@/components/ui/Button";
import { MediaLibraryGrid } from "./MediaLibraryGrid";
import type { Media } from "@/types/database";
import { X, ImagePlus } from "lucide-react";

interface MediaPickerProps {
  label: string;
  value: { id: string; storage_path: string } | null;
  onChange: (media: Media | null) => void;
}

export function MediaPicker({ label, value, onChange }: MediaPickerProps) {
  const [open, setOpen] = useState(false);
  const url = value ? mediaUrl(value.storage_path) : null;

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div className="flex items-center gap-3">
        <div className="flex h-20 w-28 items-center justify-center overflow-hidden rounded-md border border-line bg-paper">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="" className="h-full w-full object-cover" />
          ) : (
            <ImagePlus size={18} className="text-ink-faint" />
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <Button type="button" size="sm" onClick={() => setOpen(true)}>
            {value ? "Change" : "Choose image"}
          </Button>
          {value && (
            <button
              type="button"
              onClick={() => onChange(null)}
              className="text-left text-xs text-ink-faint hover:text-danger"
            >
              Remove
            </button>
          )}
        </div>
      </div>

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
              <h3 className="font-display text-lg text-ink">Choose an image</h3>
              <button onClick={() => setOpen(false)} className="text-ink-faint hover:text-ink">
                <X size={18} />
              </button>
            </div>
            <MediaLibraryGrid
              selectMode
              selectedId={value?.id ?? null}
              onSelect={(media) => {
                onChange(media);
                setOpen(false);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

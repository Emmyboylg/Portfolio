"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { uploadMediaFile } from "@/lib/media-upload.client";
import { deleteMediaAction } from "@/app/admin/(dashboard)/media/actions";
import { mediaUrl } from "@/lib/media-url";
import type { Media } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Trash2, Upload, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface MediaLibraryGridProps {
  selectMode?: boolean;
  selectedId?: string | null;
  onSelect?: (media: Media) => void;
}

export function MediaLibraryGrid({
  selectMode = false,
  selectedId,
  onSelect,
}: MediaLibraryGridProps) {
  const [items, setItems] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [kindFilter, setKindFilter] = useState<"all" | "image" | "video">("all");
  const [uploading, setUploading] = useState(false);
  const [, startTransition] = useTransition();
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function load() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("media")
      .select("*")
      .order("created_at", { ascending: false });
    setItems(data ?? []);
    setLoading(false);
  }

  useEffect(() => {
    // Fetch-on-mount: intentional, this is the initial data load, not a
    // prop-derived sync.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setUploading(true);
    for (const file of Array.from(files)) {
      const { media, error } = await uploadMediaFile(file);
      if (media) setItems((prev) => [media, ...prev]);
      if (error) alert(`Couldn't upload ${file.name}: ${error}`);
    }
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  const filtered = items.filter((item) => {
    const matchesQuery = item.file_name
      .toLowerCase()
      .includes(query.toLowerCase());
    const matchesKind = kindFilter === "all" || item.kind === kindFilter;
    return matchesQuery && matchesKind;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search media…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex rounded-md border border-line-strong p-0.5">
          {(["all", "image", "video"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKindFilter(k)}
              className={cn(
                "rounded px-2.5 py-1 text-xs capitalize",
                kindFilter === k
                  ? "bg-accent-soft text-accent"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              {k}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <Button
          variant="primary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
        >
          <Upload size={14} />
          {uploading ? "Uploading…" : "Upload"}
        </Button>
      </div>

      {loading ? (
        <p className="mt-6 text-sm text-ink-faint">Loading media…</p>
      ) : filtered.length === 0 ? (
        <p className="mt-6 text-sm text-ink-faint">
          No media yet. Upload an image or video to get started.
        </p>
      ) : (
        <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-5">
          {filtered.map((item) => {
            const url = mediaUrl(item.storage_path);
            const isSelected = selectMode && selectedId === item.id;
            return (
              <div
                key={item.id}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-md border bg-paper",
                  isSelected ? "border-accent ring-2 ring-accent/40" : "border-line"
                )}
              >
                {item.kind === "image" && url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={url}
                    alt={item.alt_text ?? item.file_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-xs text-ink-faint">
                    video
                  </div>
                )}

                {selectMode ? (
                  <button
                    onClick={() => onSelect?.(item)}
                    className="absolute inset-0 flex items-center justify-center bg-ink/0 transition-colors hover:bg-ink/30"
                  >
                    {isSelected && (
                      <span className="rounded-full bg-accent p-1 text-white">
                        <Check size={14} />
                      </span>
                    )}
                  </button>
                ) : (
                  <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-ink/60 px-1.5 py-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <span className="truncate text-[10px] text-white">
                      {item.file_name}
                    </span>
                    <ConfirmDialog
                      title="Delete this file?"
                      description="It will be removed from storage. If it's used elsewhere on the site, that image will break."
                      trigger={(open) => (
                        <button onClick={open} className="text-white/80 hover:text-white">
                          <Trash2 size={12} />
                        </button>
                      )}
                      onConfirm={() =>
                        startTransition(async () => {
                          const res = await deleteMediaAction(item.id);
                          if (!res.error) {
                            setItems((prev) => prev.filter((m) => m.id !== item.id));
                          } else {
                            alert(res.error);
                          }
                        })
                      }
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

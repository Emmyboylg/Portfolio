"use client";

import { useState } from "react";
import { mediaUrl } from "@/lib/media-url";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface ShotForGallery {
  id: string;
  title: string;
  description: string;
  tags: string[];
  tools: string[];
  images: { id: string; storage_path: string }[];
}

export function UiShotsGallery({ shots }: { shots: ShotForGallery[] }) {
  const [lightbox, setLightbox] = useState<{ shot: ShotForGallery; index: number } | null>(null);

  const visible = shots.filter((s) => s.images.length > 0);
  if (visible.length === 0) return null;

  function openLightbox(shot: ShotForGallery) {
    setLightbox({ shot, index: 0 });
  }

  function step(delta: number) {
    setLightbox((prev) => {
      if (!prev) return prev;
      const total = prev.shot.images.length;
      const nextIndex = (prev.index + delta + total) % total;
      return { ...prev, index: nextIndex };
    });
  }

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2">
        {visible.map((shot) => {
          const cover = shot.images[0];
          const url = mediaUrl(cover.storage_path);
          return (
            <div key={shot.id}>
              {url && (
                <button
                  type="button"
                  onClick={() => openLightbox(shot)}
                  className="relative block w-full overflow-hidden rounded-lg border border-line bg-surface"
                  aria-label={`View ${shot.title} full size`}
                >
                  {/* No forced aspect-ratio crop here — UI shots are often tall
                      portrait screenshots, and cropping to a fixed box was
                      cutting off most of the image on mobile. */}
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={shot.title}
                    className="h-auto w-full object-contain transition-transform duration-300 hover:scale-[1.01]"
                  />
                  {shot.images.length > 1 && (
                    <span className="absolute bottom-2 right-2 rounded-full bg-ink/70 px-2 py-0.5 text-xs text-white">
                      1 / {shot.images.length}
                    </span>
                  )}
                </button>
              )}
              <div className="mt-3">
                <h3 className="font-display text-lg text-ink">{shot.title}</h3>
                {shot.description && (
                  <p className="mt-0.5 text-sm text-ink-soft">{shot.description}</p>
                )}
                {shot.tools.length > 0 && (
                  <p className="mt-2 text-xs text-ink-faint">{shot.tools.join(" · ")}</p>
                )}
                {shot.tags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {shot.tags.map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-line-strong px-2.5 py-0.5 text-xs text-ink-soft"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6"
          onClick={() => setLightbox(null)}
        >
          <button
            onClick={() => setLightbox(null)}
            className="absolute right-6 top-6 text-white/80 hover:text-white"
            aria-label="Close"
          >
            <X size={22} />
          </button>

          {lightbox.shot.images.length > 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                step(-1);
              }}
              className="absolute left-4 text-white/80 hover:text-white sm:left-8"
              aria-label="Previous image"
            >
              <ChevronLeft size={32} />
            </button>
          )}

          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl(lightbox.shot.images[lightbox.index].storage_path) ?? ""}
            alt={lightbox.shot.title}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />

          {lightbox.shot.images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  step(1);
                }}
                className="absolute right-4 text-white/80 hover:text-white sm:right-8"
                aria-label="Next image"
              >
                <ChevronRight size={32} />
              </button>
              <span className="absolute bottom-6 rounded-full bg-white/10 px-3 py-1 text-xs text-white">
                {lightbox.index + 1} / {lightbox.shot.images.length}
              </span>
            </>
          )}
        </div>
      )}
    </>
  );
}

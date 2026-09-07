"use client";

import { useState } from "react";
import { mediaUrl } from "@/lib/media-url";
import { X } from "lucide-react";

interface ShotForGallery {
  id: string;
  title: string;
  description: string;
  tags: string[];
  tools: string[];
  mediaPath?: string | null;
}

export function UiShotsGallery({ shots }: { shots: ShotForGallery[] }) {
  const [lightbox, setLightbox] = useState<ShotForGallery | null>(null);

  if (shots.length === 0) return null;

  return (
    <>
      <div className="grid gap-8 sm:grid-cols-2">
        {shots.map((shot) => {
          const url = mediaUrl(shot.mediaPath);
          return (
            <div key={shot.id}>
              {url && (
                <button
                  type="button"
                  onClick={() => setLightbox(shot)}
                  className="block aspect-[4/3] w-full overflow-hidden rounded-lg border border-line bg-surface"
                  aria-label={`View ${shot.title} full size`}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt={shot.title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-[1.02]"
                  />
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
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={mediaUrl(lightbox.mediaPath) ?? ""}
            alt={lightbox.title}
            className="max-h-full max-w-full rounded-lg object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
}

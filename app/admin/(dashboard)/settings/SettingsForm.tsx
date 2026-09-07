"use client";

import { useState, useTransition } from "react";
import type { SiteSettings, Media } from "@/types/database";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { updateSiteSettings } from "./actions";

export function SettingsForm({
  settings,
  initialOgMedia,
}: {
  settings: SiteSettings;
  initialOgMedia: Media | null;
}) {
  const [title, setTitle] = useState(settings.site_title);
  const [description, setDescription] = useState(settings.site_description);
  const [ogMedia, setOgMedia] = useState<Media | null>(initialOgMedia);
  const [saving, startSaving] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startSaving(async () => {
      const result = await updateSiteSettings({
        site_title: title,
        site_description: description,
        default_og_image_path: ogMedia?.storage_path ?? null,
      });
      if (result.error) setError(result.error);
      else setSavedAt(new Date());
    });
  }

  return (
    <div className="max-w-xl space-y-5 rounded-lg border border-line bg-surface p-5">
      <Field label="Site title" hint="Used in the browser tab and as the default SEO title.">
        <Input value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Site description" hint="Default SEO description for pages that don't set their own.">
        <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
      </Field>
      <MediaPicker label="Default Open Graph image" value={ogMedia} onChange={setOgMedia} />

      {error && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}

      <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
        {savedAt && !error && <span className="text-xs text-ink-faint">Saved {savedAt.toLocaleTimeString()}</span>}
        <Button variant="primary" size="sm" onClick={save} disabled={saving}>
          {saving ? "Saving…" : "Save"}
        </Button>
      </div>
    </div>
  );
}

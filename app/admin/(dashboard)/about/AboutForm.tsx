"use client";

import { useState, useTransition } from "react";
import type { About, Media } from "@/types/database";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { updateAbout } from "./actions";

export function AboutForm({ about, initialProfileMedia }: { about: About; initialProfileMedia: Media | null }) {
  const [name, setName] = useState(about.name);
  const [role, setRole] = useState(about.role);
  const [location, setLocation] = useState(about.location);
  const [bio, setBio] = useState(about.bio);
  const [availability, setAvailability] = useState(about.availability_status);
  const [email, setEmail] = useState(about.email);
  const [profileMedia, setProfileMedia] = useState<Media | null>(initialProfileMedia);
  const [saving, startSaving] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startSaving(async () => {
      const result = await updateAbout({
        name,
        role,
        location,
        bio,
        profile_image_path: profileMedia?.storage_path ?? null,
        availability_status: availability,
        email,
      });
      if (result.error) setError(result.error);
      else setSavedAt(new Date());
    });
  }

  return (
    <div className="max-w-xl space-y-5 rounded-lg border border-line bg-surface p-5">
      <MediaPicker label="Profile image" value={profileMedia} onChange={setProfileMedia} />
      <Field label="Name">
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Role">
        <Input value={role} onChange={(e) => setRole(e.target.value)} />
      </Field>
      <Field label="Location">
        <Input value={location} onChange={(e) => setLocation(e.target.value)} />
      </Field>
      <Field label="Bio">
        <Textarea value={bio} onChange={(e) => setBio(e.target.value)} rows={5} />
      </Field>
      <Field label="Availability status" hint='e.g. "Open to work", "Booked until March"'>
        <Input value={availability} onChange={(e) => setAvailability(e.target.value)} />
      </Field>
      <Field label="Email">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>

      <div className="flex items-center justify-between border-t border-line pt-4">
        <div className="flex gap-3 text-xs text-ink-faint">
          <LinkButton href="/admin/skills" size="sm" variant="ghost">Manage skills →</LinkButton>
          <LinkButton href="/admin/contact" size="sm" variant="ghost">Manage social links →</LinkButton>
        </div>
        <div className="flex items-center gap-3">
          {savedAt && !error && <span className="text-xs text-ink-faint">Saved {savedAt.toLocaleTimeString()}</span>}
          <Button variant="primary" size="sm" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </div>
      </div>
      {error && <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>}
    </div>
  );
}

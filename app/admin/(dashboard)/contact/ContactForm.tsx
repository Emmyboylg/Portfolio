"use client";

import { useState, useTransition } from "react";
import type { SocialLinks } from "@/types/database";
import { Field, Input } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { updateSocialLinks } from "./actions";
import { Plus, X } from "lucide-react";

export function ContactForm({ socialLinks }: { socialLinks: SocialLinks }) {
  const [email, setEmail] = useState(socialLinks.email);
  const [linkedin, setLinkedin] = useState(socialLinks.linkedin_url ?? "");
  const [x, setX] = useState(socialLinks.x_url ?? "");
  const [otherLinks, setOtherLinks] = useState(socialLinks.other_links ?? []);
  const [saving, startSaving] = useTransition();
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  function save() {
    setError(null);
    startSaving(async () => {
      const result = await updateSocialLinks({
        email,
        linkedin_url: linkedin,
        x_url: x,
        other_links: otherLinks.filter((l) => l.label && l.url),
      });
      if (result.error) setError(result.error);
      else setSavedAt(new Date());
    });
  }

  return (
    <div className="max-w-xl space-y-5 rounded-lg border border-line bg-surface p-5">
      <Field label="Email">
        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </Field>
      <Field label="LinkedIn URL">
        <Input value={linkedin} onChange={(e) => setLinkedin(e.target.value)} placeholder="https://linkedin.com/in/…" />
      </Field>
      <Field label="X (Twitter) URL">
        <Input value={x} onChange={(e) => setX(e.target.value)} placeholder="https://x.com/…" />
      </Field>

      <div>
        <span className="mb-1.5 block text-sm font-medium text-ink">Other links</span>
        <div className="space-y-2">
          {otherLinks.map((link, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input
                placeholder="Label"
                value={link.label}
                onChange={(e) => {
                  const next = [...otherLinks];
                  next[i] = { ...next[i], label: e.target.value };
                  setOtherLinks(next);
                }}
                className="w-32"
              />
              <Input
                placeholder="https://…"
                value={link.url}
                onChange={(e) => {
                  const next = [...otherLinks];
                  next[i] = { ...next[i], url: e.target.value };
                  setOtherLinks(next);
                }}
              />
              <button
                onClick={() => setOtherLinks(otherLinks.filter((_, idx) => idx !== i))}
                className="text-ink-faint hover:text-danger"
              >
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
        <Button
          size="sm"
          className="mt-2"
          onClick={() => setOtherLinks([...otherLinks, { label: "", url: "" }])}
        >
          <Plus size={13} />
          Add link
        </Button>
      </div>

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

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { CaseStudy, Media, Project } from "@/types/database";
import { Field, Input, Textarea, Select } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { StatusBadge } from "@/components/ui/Badge";
import { updateCaseStudyMeta, toggleCaseStudyStatus } from "./actions";
import { slugify } from "@/lib/utils";
import { Eye } from "lucide-react";

export function CaseStudyMetaForm({
  caseStudy,
  projects,
  initialCover,
}: {
  caseStudy: CaseStudy;
  projects: Project[];
  initialCover: Media | null;
}) {
  const router = useRouter();
  const [title, setTitle] = useState(caseStudy.title);
  const [slug, setSlug] = useState(caseStudy.slug);
  const [summary, setSummary] = useState(caseStudy.summary);
  const [projectId, setProjectId] = useState(caseStudy.project_id ?? "");
  const [cover, setCover] = useState<Media | null>(initialCover);
  const [externalUrl, setExternalUrl] = useState(caseStudy.external_url ?? "");
  const [seoTitle, setSeoTitle] = useState(caseStudy.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(caseStudy.seo_description ?? "");
  const [status, setStatus] = useState(caseStudy.status);
  const [saving, startSaving] = useTransition();
  const [publishing, startPublishing] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function persist() {
    const result = await updateCaseStudyMeta(caseStudy.id, {
      title,
      slug: slug || slugify(title),
      summary,
      project_id: projectId || null,
      cover_media_id: cover?.id ?? null,
      external_url: externalUrl,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_og_media_id: null,
    });
    if (result?.error) setError(result.error);
    else setError(null);
    return result;
  }

  const previewHref = caseStudy.project_id
    ? `/work/${projects.find((p) => p.id === caseStudy.project_id)?.slug ?? ""}`
    : "#";

  return (
    <div className="space-y-5 rounded-lg border border-line bg-surface p-5">
      <div className="flex items-center justify-between">
        <StatusBadge status={status} />
        <div className="flex gap-2">
          {caseStudy.project_id && (
            <LinkButton href={previewHref} size="sm">
              <Eye size={14} />
              Preview
            </LinkButton>
          )}
          <Button size="sm" onClick={() => startSaving(() => { persist(); })} disabled={saving}>
            {saving ? "Saving…" : "Save draft"}
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={() =>
              startPublishing(async () => {
                await persist();
                const res = await toggleCaseStudyStatus(caseStudy.id);
                if ("status" in res) setStatus(res.status);
                router.refresh();
              })
            }
            disabled={publishing}
          >
            {publishing ? "Working…" : status === "published" ? "Unpublish" : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">{error}</p>
      )}

      <Field label="Title" required>
        <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => persist()} />
      </Field>
      <Field label="Slug">
        <Input value={slug} onChange={(e) => setSlug(e.target.value)} onBlur={() => persist()} />
      </Field>
      <Field label="Related project" hint="The case study appears on this project's public page.">
        <Select
          value={projectId}
          onChange={(e) => {
            setProjectId(e.target.value);
            persist();
          }}
        >
          <option value="">None</option>
          {projects.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Summary">
        <Textarea value={summary} onChange={(e) => setSummary(e.target.value)} onBlur={() => persist()} rows={2} />
      </Field>
      <MediaPicker
        label="Cover image"
        value={cover}
        onChange={(m) => {
          setCover(m);
          persist();
        }}
      />
      <Field label="External link" hint="Link to the full case study on Dribbble, Behance, etc. (optional)">
        <Input
          value={externalUrl}
          onChange={(e) => setExternalUrl(e.target.value)}
          onBlur={() => persist()}
          placeholder="https://dribbble.com/shots/…"
        />
      </Field>

      <details className="rounded-md border border-line p-3">
        <summary className="cursor-pointer text-sm font-medium text-ink">SEO</summary>
        <div className="mt-3 space-y-3">
          <Field label="SEO title">
            <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} onBlur={() => persist()} />
          </Field>
          <Field label="SEO description">
            <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} onBlur={() => persist()} rows={2} />
          </Field>
        </div>
      </details>
    </div>
  );
}

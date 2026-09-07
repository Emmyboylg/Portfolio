"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Field, Input, Textarea } from "@/components/ui/Field";
import { Button, LinkButton } from "@/components/ui/Button";
import { MediaPicker } from "@/components/admin/MediaPicker";
import { GalleryField } from "@/components/admin/GalleryField";
import { TagInput } from "@/components/admin/TagInput";
import { StatusBadge } from "@/components/ui/Badge";
import { createProject, updateProject, toggleProjectStatus, type ProjectInput } from "./actions";
import type { Media, Project } from "@/types/database";
import { slugify } from "@/lib/utils";
import { Eye } from "lucide-react";

interface ProjectFormProps {
  project?: Project;
  initialThumbnail?: Media | null;
  initialHero?: Media | null;
  initialOg?: Media | null;
  initialGallery?: { id: string; storage_path: string }[];
}

export function ProjectForm({
  project,
  initialThumbnail,
  initialHero,
  initialOg,
  initialGallery = [],
}: ProjectFormProps) {
  const router = useRouter();
  const isNew = !project;

  const [name, setName] = useState(project?.name ?? "");
  const [slug, setSlug] = useState(project?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!project);
  const [shortDescription, setShortDescription] = useState(project?.short_description ?? "");
  const [longDescription, setLongDescription] = useState(project?.long_description ?? "");
  const [category, setCategory] = useState(project?.category ?? "");
  const [year, setYear] = useState(project?.year?.toString() ?? "");
  const [role, setRole] = useState(project?.role ?? "");
  const [tools, setTools] = useState<string[]>(project?.tools ?? []);
  const [projectUrl, setProjectUrl] = useState(project?.project_url ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [seoTitle, setSeoTitle] = useState(project?.seo_title ?? "");
  const [seoDescription, setSeoDescription] = useState(project?.seo_description ?? "");
  const [thumbnail, setThumbnail] = useState<Media | null>(initialThumbnail ?? null);
  const [hero, setHero] = useState<Media | null>(initialHero ?? null);
  const [ogImage, setOgImage] = useState<Media | null>(initialOg ?? null);
  const [gallery, setGallery] = useState(initialGallery);

  const [status, setStatus] = useState(project?.status ?? "draft");
  const [saving, startSaving] = useTransition();
  const [publishing, startPublishing] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  function buildInput(): ProjectInput {
    return {
      name,
      slug: slug || slugify(name),
      short_description: shortDescription,
      long_description: longDescription,
      category,
      year: year ? parseInt(year, 10) : null,
      role,
      tools,
      thumbnail_media_id: thumbnail?.id ?? null,
      hero_media_id: hero?.id ?? null,
      project_url: projectUrl,
      featured,
      seo_title: seoTitle,
      seo_description: seoDescription,
      seo_og_media_id: ogImage?.id ?? null,
      gallery_media_ids: gallery.map((g) => g.id),
    };
  }

  function handleSaveDraft() {
    setError(null);
    startSaving(async () => {
      if (isNew) {
        await createProject(buildInput());
        return;
      }
      const result = await updateProject(project.id, buildInput());
      if (result?.error) setError(result.error);
      else {
        setSavedAt(new Date());
        router.refresh();
      }
    });
  }

  function handlePublishToggle() {
    if (isNew) {
      setError("Save the project first, then publish it.");
      return;
    }
    startPublishing(async () => {
      const result = await updateProject(project.id, buildInput());
      if (result?.error) {
        setError(result.error);
        return;
      }
      const toggled = await toggleProjectStatus(project.id);
      if ("status" in toggled) setStatus(toggled.status);
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl pb-16">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink">
            {isNew ? "New project" : name || "Untitled project"}
          </h1>
          {!isNew && (
            <div className="mt-1 flex items-center gap-2">
              <StatusBadge status={status} />
              <span className="text-xs text-ink-faint">/work/{slug || project?.slug}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isNew && (
            <LinkButton
              href={`/work/${project.slug}`}
              size="sm"
            >
              <Eye size={14} />
              Preview
            </LinkButton>
          )}
          <Button size="sm" onClick={handleSaveDraft} disabled={saving || !name}>
            {saving ? "Saving…" : "Save draft"}
          </Button>
          <Button
            size="sm"
            variant="primary"
            onClick={handlePublishToggle}
            disabled={publishing || !name}
          >
            {publishing
              ? "Working…"
              : status === "published"
              ? "Unpublish"
              : "Publish"}
          </Button>
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-md bg-danger-soft px-3 py-2 text-sm text-danger">
          {error}
        </p>
      )}
      {savedAt && !error && (
        <p className="mb-4 text-xs text-ink-faint">Saved {savedAt.toLocaleTimeString()}</p>
      )}

      <div className="space-y-5 rounded-lg border border-line bg-surface p-5">
        <Field label="Project name" required>
          <Input
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            placeholder="Nexura"
          />
        </Field>

        <Field label="Slug" hint="Used in the public URL: /work/your-slug">
          <Input
            value={slug}
            onChange={(e) => {
              setSlug(e.target.value);
              setSlugTouched(true);
            }}
            placeholder="nexura"
          />
        </Field>

        <Field label="Short description" hint="Shown on project cards.">
          <Textarea
            value={shortDescription}
            onChange={(e) => setShortDescription(e.target.value)}
            rows={2}
          />
        </Field>

        <Field label="Long description" hint="Shown on the project page.">
          <Textarea
            value={longDescription}
            onChange={(e) => setLongDescription(e.target.value)}
            rows={5}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Category">
            <Input value={category} onChange={(e) => setCategory(e.target.value)} />
          </Field>
          <Field label="Year">
            <Input
              type="number"
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </Field>
        </div>

        <Field label="Role">
          <Input value={role} onChange={(e) => setRole(e.target.value)} placeholder="Lead Product Designer" />
        </Field>

        <TagInput label="Tools" value={tools} onChange={setTools} placeholder="Figma, Design Systems…" />

        <Field label="Project URL">
          <Input value={projectUrl} onChange={(e) => setProjectUrl(e.target.value)} placeholder="https://…" />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <MediaPicker label="Thumbnail" value={thumbnail} onChange={setThumbnail} />
          <MediaPicker label="Hero image" value={hero} onChange={setHero} />
        </div>

        <GalleryField label="Gallery images" value={gallery} onChange={setGallery} />

        <label className="flex items-center gap-2 text-sm text-ink">
          <input
            type="checkbox"
            checked={featured}
            onChange={(e) => setFeatured(e.target.checked)}
            className="h-4 w-4 rounded border-line-strong text-accent focus:ring-accent/40"
          />
          Featured project
        </label>
      </div>

      <div className="mt-6 space-y-4 rounded-lg border border-line bg-surface p-5">
        <h2 className="text-sm font-medium text-ink">SEO</h2>
        <Field label="SEO title" hint="Defaults to the project name if left blank.">
          <Input value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} />
        </Field>
        <Field label="SEO description">
          <Textarea value={seoDescription} onChange={(e) => setSeoDescription(e.target.value)} rows={2} />
        </Field>
        <MediaPicker label="Open Graph image" value={ogImage} onChange={setOgImage} />
      </div>

      {!isNew && project && (
        <CaseStudyLink projectId={project.id} projectName={project.name} />
      )}
    </div>
  );
}

function CaseStudyLink({ projectId, projectName }: { projectId: string; projectName: string }) {
  return (
    <div className="mt-6 rounded-lg border border-line bg-surface p-5">
      <h2 className="text-sm font-medium text-ink">Case study</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Manage the detailed case study for {projectName} — content blocks,
        process, results — from the Case Studies section.
      </p>
      <LinkButton href={`/admin/case-studies?project=${projectId}`} size="sm" className="mt-3">
        Go to case studies
      </LinkButton>
    </div>
  );
}

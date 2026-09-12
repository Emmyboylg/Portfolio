import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { BlockRenderer } from "@/components/case-study/BlockRenderer";
import { mediaUrl } from "@/lib/media-url";
import { ExternalLink } from "lucide-react";
import {
  getAbout,
  getSocialLinks,
  getProjectBySlug,
  getProjectGallery,
  getCaseStudyForProject,
  getUiShotsForProject,
} from "@/lib/public-data";
import { createClient } from "@/lib/supabase/server";
import type { Media } from "@/types/database";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) return {};
  return {
    title: project.seo_title || project.name,
    description: project.seo_description || project.short_description,
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [about, socialLinks, project] = await Promise.all([
    getAbout(),
    getSocialLinks(),
    getProjectBySlug(slug),
  ]);

  if (!project) notFound();

  const [gallery, caseStudyData, relatedShots] = await Promise.all([
    getProjectGallery(project.id),
    getCaseStudyForProject(project.id),
    getUiShotsForProject(project.id),
  ]);

  // Resolve every media id referenced by case study blocks in one query.
  let mediaLookup = new Map<string, Media>();
  if (caseStudyData) {
    const ids = new Set<string>();
    for (const block of caseStudyData.blocks) {
      const data = block.data as Record<string, unknown>;
      for (const key of ["media_id", "before_media_id", "after_media_id"]) {
        if (typeof data[key] === "string") ids.add(data[key] as string);
      }
      if (Array.isArray(data.media_ids)) for (const id of data.media_ids as string[]) ids.add(id);
    }
    if (ids.size) {
      const supabase = await createClient();
      const { data: rows } = await supabase.from("media").select("*").in("id", Array.from(ids));
      mediaLookup = new Map((rows ?? []).map((m) => [m.id, m]));
    }
  }

  const heroUrl = mediaUrl(
    (project as unknown as { hero: { storage_path: string } | null }).hero?.storage_path
  );

  return (
    <>
      <Header name={about?.name ?? ""} />

      {project.status === "draft" && (
        <div className="bg-warning-soft px-6 py-2 text-center text-sm text-warning">
          This is a preview — not publicly visible.
        </div>
      )}

      <main className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-xs text-ink-faint">
          {project.category} {project.year && `· ${project.year}`}
        </p>
        <h1 className="mt-2 font-display text-4xl text-ink">{project.name}</h1>
        <p className="mt-3 max-w-xl text-lg text-ink-soft">{project.short_description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-ink-faint">
          {project.role && <span>Role: {project.role}</span>}
          {project.tools.length > 0 && <span>{project.tools.join(", ")}</span>}
          {project.project_url && (
            <a href={project.project_url} target="_blank" rel="noreferrer" className="text-accent hover:underline">
              Visit project ↗
            </a>
          )}
        </div>

        {heroUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={heroUrl} alt={project.name} className="mt-8 w-full rounded-lg" />
        )}

        {project.long_description && (
          <p className="mt-8 text-ink-soft leading-relaxed">{project.long_description}</p>
        )}

        {gallery.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3">
            {gallery.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.id}
                src={mediaUrl(img.storage_path) ?? ""}
                alt=""
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}

        {caseStudyData && caseStudyData.blocks.length > 0 && (
          <div className="mt-16 space-y-10 border-t border-line pt-12">
            {caseStudyData.caseStudy.external_url && (
              <a
                href={caseStudyData.caseStudy.external_url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2 text-sm text-ink transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
              >
                View full case study
                <ExternalLink size={14} strokeWidth={2.75} />
              </a>
            )}
            {caseStudyData.blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} mediaLookup={mediaLookup} />
            ))}
          </div>
        )}

        {relatedShots.length > 0 && (
          <div className="mt-16 border-t border-line pt-12">
            <h2 className="font-display text-xl text-ink">UI shots</h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
              {relatedShots.map((shot) => {
                const images = (shot as unknown as { images: { id: string; storage_path: string }[] }).images;
                const cover = images?.[0];
                const url = mediaUrl(cover?.storage_path);
                return url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img key={shot.id} src={url} alt={shot.title} className="aspect-square w-full rounded-lg object-cover" />
                ) : null;
              })}
            </div>
          </div>
        )}
      </main>

      <Footer socialLinks={socialLinks} />
    </>
  );
}

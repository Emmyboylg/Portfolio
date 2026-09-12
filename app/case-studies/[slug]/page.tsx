import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { BlockRenderer } from "@/components/case-study/BlockRenderer";
import { mediaUrl } from "@/lib/media-url";
import { getAbout, getSocialLinks, getCaseStudyBySlug } from "@/lib/public-data";
import { createClient } from "@/lib/supabase/server";
import type { Media } from "@/types/database";
import { ExternalLink } from "lucide-react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getCaseStudyBySlug(slug);
  if (!result) return {};
  return {
    title: result.caseStudy.seo_title || result.caseStudy.title,
    description: result.caseStudy.seo_description || result.caseStudy.summary,
  };
}

export default async function CaseStudyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [about, socialLinks, result] = await Promise.all([
    getAbout(),
    getSocialLinks(),
    getCaseStudyBySlug(slug),
  ]);

  if (!result) notFound();
  const { caseStudy, blocks } = result;
  const relatedProject = (caseStudy as unknown as {
    project: { name: string; slug: string } | null;
  }).project;
  const coverPath = (caseStudy as unknown as { cover: { storage_path: string } | null }).cover
    ?.storage_path;

  let mediaLookup = new Map<string, Media>();
  const ids = new Set<string>();
  for (const block of blocks) {
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

  return (
    <>
      <Header name={about?.name ?? ""} />

      {caseStudy.status === "draft" && (
        <div className="bg-warning-soft px-6 py-2 text-center text-sm text-warning">
          This is a preview — not publicly visible.
        </div>
      )}

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-4xl text-ink">{caseStudy.title}</h1>
        {caseStudy.summary && <p className="mt-3 text-lg text-ink-soft">{caseStudy.summary}</p>}

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm">
          {relatedProject && (
            <Link href={`/work/${relatedProject.slug}`} className="text-accent hover:underline">
              Part of {relatedProject.name} →
            </Link>
          )}
          {caseStudy.external_url && (
            <a
              href={caseStudy.external_url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface px-4 py-2 text-ink transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
            >
              View original
              <ExternalLink size={14} strokeWidth={2.75} />
            </a>
          )}
        </div>

        {coverPath && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={mediaUrl(coverPath) ?? ""} alt={caseStudy.title} className="mt-8 w-full rounded-lg" />
        )}

        {blocks.length > 0 && (
          <div className="mt-12 space-y-10">
            {blocks.map((block) => (
              <BlockRenderer key={block.id} block={block} mediaLookup={mediaLookup} />
            ))}
          </div>
        )}
      </main>

      <Footer socialLinks={socialLinks} />
    </>
  );
}

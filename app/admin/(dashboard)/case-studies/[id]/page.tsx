import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { CaseStudyMetaForm } from "../CaseStudyMetaForm";
import { BlockList } from "@/components/admin/blocks/BlockList";
import type { Media } from "@/types/database";

export default async function EditCaseStudyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: caseStudy }, { data: blocks }, { data: projects }] = await Promise.all([
    supabase.from("case_studies").select("*").eq("id", id).single(),
    supabase
      .from("case_study_sections")
      .select("*")
      .eq("case_study_id", id)
      .order("display_order"),
    supabase.from("projects").select("*").order("display_order"),
  ]);

  if (!caseStudy) notFound();

  // Gather every media id referenced anywhere in this case study's blocks
  // (plus the cover image) so the editor can resolve thumbnails without
  // a query per block.
  const mediaIds = new Set<string>();
  if (caseStudy.cover_media_id) mediaIds.add(caseStudy.cover_media_id);
  for (const block of blocks ?? []) {
    const data = block.data as Record<string, unknown>;
    for (const key of ["media_id", "before_media_id", "after_media_id"]) {
      if (typeof data[key] === "string") mediaIds.add(data[key] as string);
    }
    if (Array.isArray(data.media_ids)) {
      for (const mid of data.media_ids as string[]) mediaIds.add(mid);
    }
  }

  const { data: mediaRows } = mediaIds.size
    ? await supabase.from("media").select("*").in("id", Array.from(mediaIds))
    : { data: [] as Media[] };

  const mediaLookup = new Map((mediaRows ?? []).map((m) => [m.id, m]));

  return (
    <div className="max-w-2xl pb-16">
      <h1 className="font-display text-2xl text-ink">{caseStudy.title}</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Build the case study from flexible content blocks — reorder, duplicate, or remove
        anything below.
      </p>

      <div className="mt-6">
        <CaseStudyMetaForm
          caseStudy={caseStudy}
          projects={projects ?? []}
          initialCover={mediaLookup.get(caseStudy.cover_media_id ?? "") ?? null}
        />
      </div>

      <div className="mt-8">
        <h2 className="mb-3 text-sm font-medium text-ink">Content</h2>
        <BlockList
          caseStudyId={id}
          initialBlocks={blocks ?? []}
          mediaLookup={mediaLookup}
        />
      </div>
    </div>
  );
}

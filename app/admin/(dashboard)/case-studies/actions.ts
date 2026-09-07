"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";
import { getBlockDefinition } from "@/lib/case-study/blocks";
import type { CaseStudyBlockType } from "@/types/database";

async function uniqueSlug(base: string, ignoreId?: string) {
  const supabase = await createClient();
  let slug = slugify(base) || "case-study";
  let suffix = 1;
  while (true) {
    let query = supabase.from("case_studies").select("id").eq("slug", slug);
    if (ignoreId) query = query.neq("id", ignoreId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    suffix += 1;
    slug = `${slugify(base)}-${suffix}`;
  }
}

export async function createCaseStudy(input: {
  title: string;
  project_id: string | null;
}) {
  const supabase = await createClient();
  const slug = await uniqueSlug(input.title);

  const { data, error } = await supabase
    .from("case_studies")
    .insert({ title: input.title, slug, project_id: input.project_id, status: "draft" })
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create case study." };

  await logActivity(`Created case study "${data.title}"`, "case_study", data.id);
  revalidatePath("/admin/case-studies");
  redirect(`/admin/case-studies/${data.id}`);
}

export async function updateCaseStudyMeta(
  id: string,
  input: {
    title: string;
    slug: string;
    summary: string;
    project_id: string | null;
    cover_media_id: string | null;
    seo_title: string;
    seo_description: string;
    seo_og_media_id: string | null;
  }
) {
  const supabase = await createClient();
  const slug = await uniqueSlug(input.slug || input.title, id);

  const { data, error } = await supabase
    .from("case_studies")
    .update({
      title: input.title,
      slug,
      summary: input.summary,
      project_id: input.project_id,
      cover_media_id: input.cover_media_id,
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
      seo_og_media_id: input.seo_og_media_id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Could not save case study." };

  await logActivity(`Updated case study "${data.title}"`, "case_study", id);
  revalidatePath(`/admin/case-studies/${id}`);
  revalidatePath("/admin/case-studies");
  return { success: true, slug };
}

export async function deleteCaseStudy(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("case_studies").select("title").eq("id", id).single();
  const { error } = await supabase.from("case_studies").delete().eq("id", id);
  if (error) return { error: error.message };

  if (data) await logActivity(`Deleted case study "${data.title}"`, "case_study", id);
  revalidatePath("/admin/case-studies");
  return { success: true };
}

export async function toggleCaseStudyStatus(
  id: string
): Promise<{ error: string } | { success: true; status: "draft" | "published" }> {
  const supabase = await createClient();
  const { data: cs } = await supabase
    .from("case_studies")
    .select("status, title")
    .eq("id", id)
    .single();
  if (!cs) return { error: "Case study not found." };

  const nextStatus = cs.status === "published" ? "draft" : "published";
  const { error } = await supabase
    .from("case_studies")
    .update({ status: nextStatus })
    .eq("id", id);
  if (error) return { error: error.message };

  await logActivity(
    `${nextStatus === "published" ? "Published" : "Unpublished"} case study "${cs.title}"`,
    "case_study",
    id
  );
  revalidatePath("/admin/case-studies");
  revalidatePath(`/admin/case-studies/${id}`);
  return { success: true, status: nextStatus };
}

// ---- Blocks ----

export async function addBlock(caseStudyId: string, blockType: CaseStudyBlockType) {
  const supabase = await createClient();
  const def = getBlockDefinition(blockType);

  const { count } = await supabase
    .from("case_study_sections")
    .select("id", { count: "exact", head: true })
    .eq("case_study_id", caseStudyId);

  const { data, error } = await supabase
    .from("case_study_sections")
    .insert({
      case_study_id: caseStudyId,
      block_type: blockType,
      data: def.defaultData,
      display_order: count ?? 0,
    })
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Could not add block." };
  revalidatePath(`/admin/case-studies/${caseStudyId}`);
  return { success: true, block: data };
}

export async function updateBlockData(blockId: string, data: Record<string, unknown>) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("case_study_sections")
    .update({ data })
    .eq("id", blockId);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteBlock(blockId: string, caseStudyId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("case_study_sections").delete().eq("id", blockId);
  if (error) return { error: error.message };
  revalidatePath(`/admin/case-studies/${caseStudyId}`);
  return { success: true };
}

export async function duplicateBlock(blockId: string, caseStudyId: string) {
  const supabase = await createClient();
  const { data: original } = await supabase
    .from("case_study_sections")
    .select("*")
    .eq("id", blockId)
    .single();
  if (!original) return { error: "Block not found." };

  const { count } = await supabase
    .from("case_study_sections")
    .select("id", { count: "exact", head: true })
    .eq("case_study_id", caseStudyId);

  const { data, error } = await supabase
    .from("case_study_sections")
    .insert({
      case_study_id: caseStudyId,
      block_type: original.block_type,
      data: original.data,
      display_order: count ?? 0,
    })
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Could not duplicate block." };
  revalidatePath(`/admin/case-studies/${caseStudyId}`);
  return { success: true, block: data };
}

export async function reorderBlocks(caseStudyId: string, orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("case_study_sections").update({ display_order: index }).eq("id", id)
    )
  );
  revalidatePath(`/admin/case-studies/${caseStudyId}`);
  return { success: true };
}

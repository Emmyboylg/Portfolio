"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";
import { slugify } from "@/lib/utils";

export interface UseCaseInput {
  title: string;
  slug: string;
  short_description: string;
  problem: string;
  solution: string;
  related_project_id: string | null;
  tags: string[];
  seo_title: string;
  seo_description: string;
  image_media_ids: string[];
}

async function uniqueSlug(base: string, ignoreId?: string) {
  const supabase = await createClient();
  let slug = slugify(base) || "use-case";
  let suffix = 1;
  while (true) {
    let query = supabase.from("use_cases").select("id").eq("slug", slug);
    if (ignoreId) query = query.neq("id", ignoreId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    suffix += 1;
    slug = `${slugify(base)}-${suffix}`;
  }
}

async function syncImages(useCaseId: string, mediaIds: string[]) {
  const supabase = await createClient();
  await supabase.from("use_case_images").delete().eq("use_case_id", useCaseId);
  if (mediaIds.length === 0) return;
  await supabase.from("use_case_images").insert(
    mediaIds.map((media_id, index) => ({ use_case_id: useCaseId, media_id, display_order: index }))
  );
}

export async function createUseCase(input: UseCaseInput) {
  const supabase = await createClient();
  const slug = await uniqueSlug(input.slug || input.title);
  const { count } = await supabase
    .from("use_cases")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("use_cases")
    .insert({
      title: input.title,
      slug,
      short_description: input.short_description,
      problem: input.problem,
      solution: input.solution,
      related_project_id: input.related_project_id,
      tags: input.tags,
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
      status: "draft",
      display_order: count ?? 0,
    })
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create use case." };

  await syncImages(data.id, input.image_media_ids);
  await logActivity(`Created use case "${data.title}"`, "use_case", data.id);
  revalidatePath("/admin/use-cases");
  return { success: true, data };
}

export async function updateUseCase(id: string, input: UseCaseInput) {
  const supabase = await createClient();
  const slug = await uniqueSlug(input.slug || input.title, id);

  const { data, error } = await supabase
    .from("use_cases")
    .update({
      title: input.title,
      slug,
      short_description: input.short_description,
      problem: input.problem,
      solution: input.solution,
      related_project_id: input.related_project_id,
      tags: input.tags,
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Could not save use case." };

  await syncImages(id, input.image_media_ids);
  await logActivity(`Updated use case "${data.title}"`, "use_case", id);
  revalidatePath("/admin/use-cases");
  return { success: true, data };
}

export async function deleteUseCase(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("use_cases").select("title").eq("id", id).single();
  const { error } = await supabase.from("use_cases").delete().eq("id", id);
  if (error) return { error: error.message };
  if (data) await logActivity(`Deleted use case "${data.title}"`, "use_case", id);
  revalidatePath("/admin/use-cases");
  return { success: true };
}

export async function toggleUseCaseStatus(
  id: string
): Promise<{ error: string } | { success: true; status: "draft" | "published" }> {
  const supabase = await createClient();
  const { data: uc } = await supabase.from("use_cases").select("status").eq("id", id).single();
  if (!uc) return { error: "Not found." };
  const nextStatus = uc.status === "published" ? "draft" : "published";
  const { error } = await supabase.from("use_cases").update({ status: nextStatus }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/use-cases");
  return { success: true, status: nextStatus };
}

export async function reorderUseCases(orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("use_cases").update({ display_order: index }).eq("id", id)
    )
  );
  revalidatePath("/admin/use-cases");
  return { success: true };
}

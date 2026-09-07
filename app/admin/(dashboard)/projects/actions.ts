"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { slugify } from "@/lib/utils";

export interface ProjectInput {
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  category: string;
  year: number | null;
  role: string;
  tools: string[];
  thumbnail_media_id: string | null;
  hero_media_id: string | null;
  project_url: string;
  featured: boolean;
  seo_title: string;
  seo_description: string;
  seo_og_media_id: string | null;
  gallery_media_ids: string[];
}

async function uniqueSlug(base: string, ignoreId?: string) {
  const supabase = await createClient();
  let slug = slugify(base) || "project";
  let suffix = 1;
  // small, deliberately simple loop — project counts here are never large
  while (true) {
    let query = supabase.from("projects").select("id").eq("slug", slug);
    if (ignoreId) query = query.neq("id", ignoreId);
    const { data } = await query.maybeSingle();
    if (!data) return slug;
    suffix += 1;
    slug = `${slugify(base)}-${suffix}`;
  }
}

export async function createProject(input: ProjectInput) {
  const supabase = await createClient();
  const slug = await uniqueSlug(input.slug || input.name);

  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true });

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name: input.name,
      slug,
      short_description: input.short_description,
      long_description: input.long_description,
      category: input.category || null,
      year: input.year,
      role: input.role || null,
      tools: input.tools,
      thumbnail_media_id: input.thumbnail_media_id,
      hero_media_id: input.hero_media_id,
      project_url: input.project_url || null,
      featured: input.featured,
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
      seo_og_media_id: input.seo_og_media_id,
      status: "draft",
      display_order: count ?? 0,
    })
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create project." };

  await syncGallery(data.id, input.gallery_media_ids);
  await logActivity(`Created project "${data.name}"`, "project", data.id);
  revalidatePath("/admin/projects");
  redirect(`/admin/projects/${data.id}`);
}

export async function updateProject(id: string, input: ProjectInput) {
  const supabase = await createClient();
  const slug = await uniqueSlug(input.slug || input.name, id);

  const { data, error } = await supabase
    .from("projects")
    .update({
      name: input.name,
      slug,
      short_description: input.short_description,
      long_description: input.long_description,
      category: input.category || null,
      year: input.year,
      role: input.role || null,
      tools: input.tools,
      thumbnail_media_id: input.thumbnail_media_id,
      hero_media_id: input.hero_media_id,
      project_url: input.project_url || null,
      featured: input.featured,
      seo_title: input.seo_title || null,
      seo_description: input.seo_description || null,
      seo_og_media_id: input.seo_og_media_id,
    })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Could not save project." };

  await syncGallery(id, input.gallery_media_ids);
  await logActivity(`Updated project "${data.name}"`, "project", data.id);
  revalidatePath("/admin/projects");
  revalidatePath(`/admin/projects/${id}`);
  revalidatePath(`/work/${slug}`);
  return { success: true, slug };
}

async function syncGallery(projectId: string, mediaIds: string[]) {
  const supabase = await createClient();
  await supabase.from("project_gallery_images").delete().eq("project_id", projectId);
  if (mediaIds.length === 0) return;
  await supabase.from("project_gallery_images").insert(
    mediaIds.map((media_id, index) => ({
      project_id: projectId,
      media_id,
      display_order: index,
    }))
  );
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("projects").select("name, slug").eq("id", id).single();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { error: error.message };

  if (data) {
    await logActivity(`Deleted project "${data.name}"`, "project", id);
    revalidatePath(`/work/${data.slug}`);
  }
  revalidatePath("/admin/projects");
  return { success: true };
}

export async function duplicateProject(id: string) {
  const supabase = await createClient();
  const { data: original, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();
  if (error || !original) return { error: "Project not found." };

  const slug = await uniqueSlug(`${original.slug}-copy`);
  const { count } = await supabase
    .from("projects")
    .select("id", { count: "exact", head: true });

  const { data: copy, error: insertError } = await supabase
    .from("projects")
    .insert({
      ...original,
      id: undefined,
      name: `${original.name} (copy)`,
      slug,
      status: "draft",
      display_order: count ?? 0,
      created_at: undefined,
      updated_at: undefined,
    })
    .select()
    .single();

  if (insertError || !copy) return { error: insertError?.message ?? "Could not duplicate." };

  const { data: galleryRows } = await supabase
    .from("project_gallery_images")
    .select("media_id, display_order")
    .eq("project_id", id);

  if (galleryRows && galleryRows.length > 0) {
    await supabase.from("project_gallery_images").insert(
      galleryRows.map((row) => ({
        project_id: copy.id,
        media_id: row.media_id,
        display_order: row.display_order,
      }))
    );
  }

  await logActivity(`Duplicated project "${original.name}"`, "project", copy.id);
  revalidatePath("/admin/projects");
  return { success: true, id: copy.id };
}

export async function toggleProjectStatus(
  id: string
): Promise<{ error: string } | { success: true; status: "draft" | "published" }> {
  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("status, name, slug")
    .eq("id", id)
    .single();
  if (!project) return { error: "Project not found." };

  const nextStatus = project.status === "published" ? "draft" : "published";
  const { error } = await supabase
    .from("projects")
    .update({ status: nextStatus })
    .eq("id", id);
  if (error) return { error: error.message };

  await logActivity(
    `${nextStatus === "published" ? "Published" : "Unpublished"} "${project.name}"`,
    "project",
    id
  );
  revalidatePath("/admin/projects");
  revalidatePath(`/work/${project.slug}`);
  revalidatePath("/work");
  return { success: true, status: nextStatus };
}

export async function reorderProjects(orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("projects").update({ display_order: index }).eq("id", id)
    )
  );
  revalidatePath("/admin/projects");
  revalidatePath("/work");
  return { success: true };
}

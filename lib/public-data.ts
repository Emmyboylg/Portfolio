import { createClient } from "@/lib/supabase/server";

export async function getAbout() {
  const supabase = await createClient();
  const { data } = await supabase.from("about").select("*").limit(1).maybeSingle();
  return data;
}

export async function getSocialLinks() {
  const supabase = await createClient();
  const { data } = await supabase.from("social_links").select("*").limit(1).maybeSingle();
  return data;
}

export async function getSkills() {
  const supabase = await createClient();
  const { data } = await supabase.from("skills").select("*").order("display_order");
  return data ?? [];
}

export async function getTools() {
  const supabase = await createClient();
  const { data } = await supabase.from("tools").select("*").order("display_order");
  return data ?? [];
}

export async function getExperience() {
  const supabase = await createClient();
  const { data } = await supabase.from("experience").select("*").order("display_order");
  return data ?? [];
}

// RLS already filters to published-only for anonymous visitors, and
// shows everything (including drafts) when the request is authenticated
// as the admin — which is exactly what makes /work/[slug] double as a
// live preview when you're signed in.
export async function getPublishedProjects() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*, thumbnail:thumbnail_media_id(storage_path)")
    .order("display_order");
  return data ?? [];
}

export async function getProjectBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("projects")
    .select("*, thumbnail:thumbnail_media_id(storage_path), hero:hero_media_id(storage_path)")
    .eq("slug", slug)
    .maybeSingle();
  return data;
}

export async function getCaseStudyForProject(projectId: string) {
  const supabase = await createClient();
  const { data: caseStudy } = await supabase
    .from("case_studies")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();
  if (!caseStudy) return null;

  const { data: blocks } = await supabase
    .from("case_study_sections")
    .select("*")
    .eq("case_study_id", caseStudy.id)
    .order("display_order");

  return { caseStudy, blocks: blocks ?? [] };
}

export async function getProjectGallery(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("project_gallery_images")
    .select("display_order, media:media_id(id, storage_path)")
    .eq("project_id", projectId)
    .order("display_order");
  return (data ?? [])
    .map((row) => (row as unknown as { media: { id: string; storage_path: string } | null }).media)
    .filter(Boolean) as { id: string; storage_path: string }[];
}

export async function getUiShots() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ui_shots")
    .select("*, media:media_id(storage_path), project:project_id(name, slug)")
    .order("display_order");
  return data ?? [];
}

export async function getUiShotsForProject(projectId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("ui_shots")
    .select("*, media:media_id(storage_path)")
    .eq("project_id", projectId)
    .order("display_order");
  return data ?? [];
}

export async function getUseCases() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("use_cases")
    .select("*, related_project:related_project_id(name, slug)")
    .order("display_order");
  return data ?? [];
}

export async function getUseCaseBySlug(slug: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("use_cases")
    .select("*, related_project:related_project_id(name, slug)")
    .eq("slug", slug)
    .maybeSingle();
  if (!data) return null;

  const { data: imageRows } = await supabase
    .from("use_case_images")
    .select("display_order, media:media_id(id, storage_path)")
    .eq("use_case_id", data.id)
    .order("display_order");

  const images = (imageRows ?? [])
    .map((row) => (row as unknown as { media: { id: string; storage_path: string } | null }).media)
    .filter(Boolean) as { id: string; storage_path: string }[];

  return { useCase: data, images };
}

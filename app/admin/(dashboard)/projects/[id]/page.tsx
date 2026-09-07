import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { ProjectForm } from "../ProjectForm";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (!project) notFound();

  const mediaIds = [
    project.thumbnail_media_id,
    project.hero_media_id,
    project.seo_og_media_id,
  ].filter(Boolean) as string[];

  const [{ data: mediaRows }, { data: galleryRows }] = await Promise.all([
    mediaIds.length
      ? supabase.from("media").select("*").in("id", mediaIds)
      : Promise.resolve({ data: [] }),
    supabase
      .from("project_gallery_images")
      .select("display_order, media:media_id(id, storage_path)")
      .eq("project_id", id)
      .order("display_order"),
  ]);

  const mediaById = new Map((mediaRows ?? []).map((m) => [m.id, m]));

  return (
    <ProjectForm
      project={project}
      initialThumbnail={mediaById.get(project.thumbnail_media_id ?? "") ?? null}
      initialHero={mediaById.get(project.hero_media_id ?? "") ?? null}
      initialOg={mediaById.get(project.seo_og_media_id ?? "") ?? null}
      initialGallery={
        (galleryRows ?? [])
          .map(
            (row) =>
              (row as unknown as { media: { id: string; storage_path: string } | null }).media
          )
          .filter(Boolean) as { id: string; storage_path: string }[]
      }
    />
  );
}

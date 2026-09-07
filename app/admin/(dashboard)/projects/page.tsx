import { createClient } from "@/lib/supabase/server";
import { ProjectList } from "./ProjectList";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data: projects } = await supabase
    .from("projects")
    .select("*, thumbnail:thumbnail_media_id(storage_path)")
    .order("display_order");

  const withThumb = (projects ?? []).map((p) => ({
    ...p,
    thumbnail_path: (p as unknown as { thumbnail: { storage_path: string } | null }).thumbnail
      ?.storage_path,
  }));

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl text-ink">Projects</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Drag to reorder — the public portfolio reflects this order exactly.
      </p>
      <div className="mt-6">
        <ProjectList initialProjects={withThumb} />
      </div>
    </div>
  );
}

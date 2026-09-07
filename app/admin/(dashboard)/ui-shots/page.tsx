import { createClient } from "@/lib/supabase/server";
import { UiShotsClient } from "./UiShotsClient";

export default async function UiShotsPage() {
  const supabase = await createClient();
  const [{ data: shots }, { data: projects }] = await Promise.all([
    supabase.from("ui_shots").select("*").order("display_order"),
    supabase.from("projects").select("*").order("display_order"),
  ]);

  const ids = (shots ?? []).map((s) => s.id);
  const { data: imageRows } = ids.length
    ? await supabase
        .from("ui_shot_images")
        .select("ui_shot_id, display_order, media:media_id(id, storage_path)")
        .in("ui_shot_id", ids)
        .order("display_order")
    : { data: [] };

  const imagesByShot = new Map<string, { id: string; storage_path: string }[]>();
  for (const row of imageRows ?? []) {
    const list = imagesByShot.get(row.ui_shot_id) ?? [];
    const media = (row as unknown as { media: { id: string; storage_path: string } | null }).media;
    if (media) list.push(media);
    imagesByShot.set(row.ui_shot_id, list);
  }

  const withImages = (shots ?? []).map((s) => ({
    ...s,
    images: imagesByShot.get(s.id) ?? [],
  }));

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-ink">UI Shots</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Individual interface shots, optionally tied to a project. Each can have more than one image.
      </p>
      <div className="mt-6">
        <UiShotsClient initialShots={withImages} projects={projects ?? []} />
      </div>
    </div>
  );
}

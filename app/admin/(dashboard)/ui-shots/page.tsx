import { createClient } from "@/lib/supabase/server";
import { UiShotsClient } from "./UiShotsClient";

export default async function UiShotsPage() {
  const supabase = await createClient();
  const [{ data: shots }, { data: projects }] = await Promise.all([
    supabase
      .from("ui_shots")
      .select("*, media:media_id(*)")
      .order("display_order"),
    supabase.from("projects").select("*").order("display_order"),
  ]);

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-ink">UI Shots</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Individual interface shots, optionally tied to a project.
      </p>
      <div className="mt-6">
        <UiShotsClient initialShots={shots ?? []} projects={projects ?? []} />
      </div>
    </div>
  );
}

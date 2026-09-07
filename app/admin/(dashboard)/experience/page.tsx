import { createClient } from "@/lib/supabase/server";
import { ExperienceClient } from "./ExperienceClient";

export default async function ExperiencePage() {
  const supabase = await createClient();
  const { data: items } = await supabase.from("experience").select("*").order("display_order");

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl text-ink">Experience</h1>
      <p className="mt-1 text-sm text-ink-soft">Work history shown on the About section.</p>
      <div className="mt-6">
        <ExperienceClient initialItems={items ?? []} />
      </div>
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { SettingsForm } from "./SettingsForm";
import type { Media } from "@/types/database";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase.from("site_settings").select("*").limit(1).single();

  let ogMedia: Media | null = null;
  if (settings?.default_og_image_path) {
    const { data } = await supabase
      .from("media")
      .select("*")
      .eq("storage_path", settings.default_og_image_path)
      .maybeSingle();
    ogMedia = data ?? null;
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">Settings</h1>
      <p className="mt-1 text-sm text-ink-soft">Site-wide defaults.</p>
      <div className="mt-6">
        <SettingsForm settings={settings!} initialOgMedia={ogMedia} />
      </div>
    </div>
  );
}

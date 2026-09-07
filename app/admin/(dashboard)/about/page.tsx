import { createClient } from "@/lib/supabase/server";
import { AboutForm } from "./AboutForm";
import type { Media } from "@/types/database";

export default async function AboutPage() {
  const supabase = await createClient();
  const { data: about } = await supabase.from("about").select("*").limit(1).single();

  let profileMedia: Media | null = null;
  if (about?.profile_image_path) {
    const { data } = await supabase
      .from("media")
      .select("*")
      .eq("storage_path", about.profile_image_path)
      .maybeSingle();
    profileMedia =
      data ??
      ({
        id: "",
        storage_path: about.profile_image_path,
        file_name: "",
        mime_type: null,
        width: null,
        height: null,
        size_bytes: null,
        alt_text: null,
        kind: "image",
        created_at: "",
      } as Media);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink">About</h1>
      <p className="mt-1 text-sm text-ink-soft">
        This powers the About section of the public portfolio.
      </p>
      <div className="mt-6">
        <AboutForm about={about!} initialProfileMedia={profileMedia} />
      </div>
    </div>
  );
}

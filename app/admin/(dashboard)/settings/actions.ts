"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSiteSettings(input: {
  site_title: string;
  site_description: string;
  default_og_image_path: string | null;
}) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("site_settings").select("id").limit(1).maybeSingle();

  const { error } = existing
    ? await supabase.from("site_settings").update(input).eq("id", existing.id)
    : await supabase.from("site_settings").insert(input);

  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { success: true };
}

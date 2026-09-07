"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function updateAbout(input: {
  name: string;
  role: string;
  location: string;
  bio: string;
  profile_image_path: string | null;
  availability_status: string;
  email: string;
}) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("about").select("id").limit(1).maybeSingle();

  const { error } = existing
    ? await supabase.from("about").update(input).eq("id", existing.id)
    : await supabase.from("about").insert(input);

  if (error) return { error: error.message };

  await logActivity("Updated About");
  revalidatePath("/admin/about");
  revalidatePath("/");
  return { success: true };
}

"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function updateSocialLinks(input: {
  email: string;
  linkedin_url: string;
  x_url: string;
  other_links: { label: string; url: string }[];
}) {
  const supabase = await createClient();
  const { data: existing } = await supabase.from("social_links").select("id").limit(1).maybeSingle();

  const { error } = existing
    ? await supabase.from("social_links").update(input).eq("id", existing.id)
    : await supabase.from("social_links").insert(input);

  if (error) return { error: error.message };
  revalidatePath("/admin/contact");
  revalidatePath("/");
  return { success: true };
}

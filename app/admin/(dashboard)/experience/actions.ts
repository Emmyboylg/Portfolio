"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export interface ExperienceInput {
  company: string;
  role: string;
  start_date: string | null;
  end_date: string | null;
  description: string;
}

export async function createExperience(input: ExperienceInput) {
  const supabase = await createClient();
  const { count } = await supabase.from("experience").select("id", { count: "exact", head: true });
  const { data, error } = await supabase
    .from("experience")
    .insert({ ...input, display_order: count ?? 0 })
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/experience");
  return { success: true, data };
}

export async function updateExperience(id: string, input: ExperienceInput) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("experience")
    .update(input)
    .eq("id", id)
    .select()
    .single();
  if (error) return { error: error.message };
  revalidatePath("/admin/experience");
  return { success: true, data };
}

export async function deleteExperience(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("experience").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/experience");
  return { success: true };
}

export async function reorderExperience(orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) => supabase.from("experience").update({ display_order: index }).eq("id", id))
  );
  revalidatePath("/admin/experience");
  return { success: true };
}

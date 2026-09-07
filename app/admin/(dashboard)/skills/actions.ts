"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

// ---- Skills ----
export async function addSkill(label: string) {
  const supabase = await createClient();
  const { count } = await supabase.from("skills").select("id", { count: "exact", head: true });
  const { data } = await supabase
    .from("skills")
    .insert({ label, display_order: count ?? 0 })
    .select()
    .single();
  revalidatePath("/admin/skills");
  return data ?? null;
}

export async function renameSkill(id: string, label: string) {
  const supabase = await createClient();
  await supabase.from("skills").update({ label }).eq("id", id);
  revalidatePath("/admin/skills");
}

export async function deleteSkill(id: string) {
  const supabase = await createClient();
  await supabase.from("skills").delete().eq("id", id);
  revalidatePath("/admin/skills");
}

export async function reorderSkills(orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) => supabase.from("skills").update({ display_order: index }).eq("id", id))
  );
  revalidatePath("/admin/skills");
}

// ---- Tools ----
export async function addTool(label: string) {
  const supabase = await createClient();
  const { count } = await supabase.from("tools").select("id", { count: "exact", head: true });
  const { data } = await supabase
    .from("tools")
    .insert({ label, display_order: count ?? 0 })
    .select()
    .single();
  revalidatePath("/admin/skills");
  return data ?? null;
}

export async function renameTool(id: string, label: string) {
  const supabase = await createClient();
  await supabase.from("tools").update({ label }).eq("id", id);
  revalidatePath("/admin/skills");
}

export async function deleteTool(id: string) {
  const supabase = await createClient();
  await supabase.from("tools").delete().eq("id", id);
  revalidatePath("/admin/skills");
}

export async function reorderTools(orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) => supabase.from("tools").update({ display_order: index }).eq("id", id))
  );
  revalidatePath("/admin/skills");
}

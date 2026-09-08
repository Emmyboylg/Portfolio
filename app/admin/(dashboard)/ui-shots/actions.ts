"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export interface UiShotInput {
  title: string;
  description: string;
  project_id: string | null;
  tags: string[];
  tools: string[];
  external_url: string;
  featured: boolean;
  image_media_ids: string[]; // one or more images, in display order
}

async function syncImages(uiShotId: string, mediaIds: string[]) {
  const supabase = await createClient();
  await supabase.from("ui_shot_images").delete().eq("ui_shot_id", uiShotId);
  if (mediaIds.length > 0) {
    await supabase.from("ui_shot_images").insert(
      mediaIds.map((media_id, index) => ({ ui_shot_id: uiShotId, media_id, display_order: index }))
    );
  }
  // Keep the legacy single `media_id` column pointing at the first image,
  // so any older query that still reads it directly keeps working.
  await supabase
    .from("ui_shots")
    .update({ media_id: mediaIds[0] ?? null })
    .eq("id", uiShotId);
}

export async function createUiShot(input: UiShotInput) {
  const supabase = await createClient();
  const { count } = await supabase
    .from("ui_shots")
    .select("id", { count: "exact", head: true });

  const { image_media_ids, external_url, ...rest } = input;

  const { data, error } = await supabase
    .from("ui_shots")
    .insert({ ...rest, external_url: external_url || null, status: "draft", display_order: count ?? 0 })
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Could not create UI shot." };

  await syncImages(data.id, image_media_ids);
  await logActivity(`Added UI shot "${data.title}"`, "ui_shot", data.id);
  revalidatePath("/admin/ui-shots");
  revalidatePath("/");
  return { success: true, data };
}

export async function updateUiShot(id: string, input: UiShotInput) {
  const supabase = await createClient();
  const { image_media_ids, external_url, ...rest } = input;

  const { data, error } = await supabase
    .from("ui_shots")
    .update({ ...rest, external_url: external_url || null })
    .eq("id", id)
    .select()
    .single();

  if (error || !data) return { error: error?.message ?? "Could not save UI shot." };

  await syncImages(id, image_media_ids);
  await logActivity(`Updated UI shot "${data.title}"`, "ui_shot", id);
  revalidatePath("/admin/ui-shots");
  revalidatePath("/");
  return { success: true, data };
}

export async function deleteUiShot(id: string) {
  const supabase = await createClient();
  const { data } = await supabase.from("ui_shots").select("title").eq("id", id).single();
  const { error } = await supabase.from("ui_shots").delete().eq("id", id);
  if (error) return { error: error.message };
  if (data) await logActivity(`Deleted UI shot "${data.title}"`, "ui_shot", id);
  revalidatePath("/admin/ui-shots");
  revalidatePath("/");
  return { success: true };
}

export async function toggleUiShotStatus(
  id: string
): Promise<{ error: string } | { success: true; status: "draft" | "published" }> {
  const supabase = await createClient();
  const { data: shot } = await supabase.from("ui_shots").select("status").eq("id", id).single();
  if (!shot) return { error: "Not found." };
  const nextStatus = shot.status === "published" ? "draft" : "published";
  const { error } = await supabase.from("ui_shots").update({ status: nextStatus }).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin/ui-shots");
  revalidatePath("/");
  return { success: true, status: nextStatus };
}

export async function reorderUiShots(orderedIds: string[]) {
  const supabase = await createClient();
  await Promise.all(
    orderedIds.map((id, index) =>
      supabase.from("ui_shots").update({ display_order: index }).eq("id", id)
    )
  );
  revalidatePath("/admin/ui-shots");
  return { success: true };
}

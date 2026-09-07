"use server";

import { createClient } from "@/lib/supabase/server";
import { logActivity } from "@/lib/activity";
import { revalidatePath } from "next/cache";

export async function deleteMediaAction(mediaId: string) {
  const supabase = await createClient();

  const { data: media, error: fetchError } = await supabase
    .from("media")
    .select("storage_path, file_name")
    .eq("id", mediaId)
    .single();

  if (fetchError || !media) {
    return { error: "That file no longer exists." };
  }

  // Remove the DB row first: if this fails we haven't orphaned storage.
  const { error: deleteRowError } = await supabase
    .from("media")
    .delete()
    .eq("id", mediaId);

  if (deleteRowError) {
    return { error: "Could not delete this file. It may still be in use." };
  }

  await supabase.storage.from("media").remove([media.storage_path]);
  await logActivity(`Deleted media "${media.file_name}"`, "media", mediaId);
  revalidatePath("/admin/media");

  return { success: true };
}

export async function recordMediaUpload(input: {
  storage_path: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  kind: "image" | "video";
  width?: number;
  height?: number;
}) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("media")
    .insert(input)
    .select()
    .single();

  if (error) return { error: error.message };

  await logActivity(`Uploaded "${input.file_name}"`, "media", data.id);
  revalidatePath("/admin/media");
  return { data };
}

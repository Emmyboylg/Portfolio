import { createClient } from "@/lib/supabase/client";
import { recordMediaUpload } from "@/app/admin/(dashboard)/media/actions";
import type { Media } from "@/types/database";

function readImageDimensions(
  file: File
): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return Promise.resolve({});
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
      URL.revokeObjectURL(url);
    };
    img.onerror = () => resolve({});
    img.src = url;
  });
}

export async function uploadMediaFile(
  file: File
): Promise<{ media?: Media; error?: string }> {
  const supabase = createClient();
  const ext = file.name.split(".").pop();
  const path = `${crypto.randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("media")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const { width, height } = await readImageDimensions(file);
  const kind = file.type.startsWith("video/") ? "video" : "image";

  const result = await recordMediaUpload({
    storage_path: path,
    file_name: file.name,
    mime_type: file.type,
    size_bytes: file.size,
    kind,
    width,
    height,
  });

  if (result.error) return { error: result.error };
  return { media: result.data as Media };
}

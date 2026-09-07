// Media is stored in a public Supabase Storage bucket ("media"). Given a
// storage path (as saved on the `media` table), build the public URL.
// This is a pure string function — safe to call from client or server.
export function mediaUrl(storagePath: string | null | undefined): string | null {
  if (!storagePath) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base}/storage/v1/object/public/media/${storagePath}`;
}

import { createBrowserClient } from "@supabase/ssr";

// Note: not parameterized with the hand-written `Database` type here.
// Many queries in this app use Supabase's embedded/foreign-table select
// syntax (e.g. `.select("*, thumbnail:thumbnail_media_id(storage_path)")`),
// and correctly typing those joins requires real relationship metadata
// that only Supabase's own generator produces. Once you've connected a
// live project, run:
//   npx supabase gen types typescript --project-id YOUR_PROJECT_ID > types/database.ts
// and re-add `<Database>` here for full end-to-end type safety.
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}

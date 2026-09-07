import { createClient } from "@/lib/supabase/server";

export async function logActivity(
  message: string,
  entityType?: string,
  entityId?: string
) {
  const supabase = await createClient();
  await supabase.from("activity_log").insert({
    message,
    entity_type: entityType ?? null,
    entity_id: entityId ?? null,
  });
}

import { createClient } from "@/lib/supabase/server";
import { UseCasesClient } from "./UseCasesClient";

export default async function UseCasesPage() {
  const supabase = await createClient();
  const [{ data: useCases }, { data: projects }] = await Promise.all([
    supabase.from("use_cases").select("*").order("display_order"),
    supabase.from("projects").select("*").order("display_order"),
  ]);

  const ids = (useCases ?? []).map((u) => u.id);
  const { data: imageRows } = ids.length
    ? await supabase
        .from("use_case_images")
        .select("use_case_id, display_order, media:media_id(id, storage_path)")
        .in("use_case_id", ids)
        .order("display_order")
    : { data: [] };

  const imagesByUseCase = new Map<string, { id: string; storage_path: string }[]>();
  for (const row of imageRows ?? []) {
    const list = imagesByUseCase.get(row.use_case_id) ?? [];
    const media = (row as unknown as { media: { id: string; storage_path: string } | null }).media;
    if (media) list.push(media);
    imagesByUseCase.set(row.use_case_id, list);
  }

  const withImages = (useCases ?? []).map((u) => ({
    ...u,
    images: imagesByUseCase.get(u.id) ?? [],
  }));

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-ink">Use cases</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Independent write-ups of specific problems solved — can optionally link to a project.
      </p>
      <div className="mt-6">
        <UseCasesClient initialUseCases={withImages} projects={projects ?? []} />
      </div>
    </div>
  );
}

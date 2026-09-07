import { createClient } from "@/lib/supabase/server";
import { CaseStudiesClient } from "./CaseStudiesClient";

export default async function CaseStudiesPage() {
  const supabase = await createClient();
  const [{ data: caseStudies }, { data: projects }] = await Promise.all([
    supabase
      .from("case_studies")
      .select("*, project:project_id(name)")
      .order("created_at", { ascending: false }),
    supabase.from("projects").select("*").order("display_order"),
  ]);

  const withProjectName = (caseStudies ?? []).map((cs) => ({
    ...cs,
    project_name: (cs as unknown as { project: { name: string } | null }).project?.name,
  }));

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-2xl text-ink">Case studies</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Build detailed, block-based write-ups for any project.
      </p>
      <div className="mt-6">
        <CaseStudiesClient initialCaseStudies={withProjectName} projects={projects ?? []} />
      </div>
    </div>
  );
}

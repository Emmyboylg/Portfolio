import { createClient } from "@/lib/supabase/server";
import { timeAgo } from "@/lib/utils";

async function getCounts() {
  const supabase = await createClient();

  const [projects, published, drafts, caseStudies, uiShots] =
    await Promise.all([
      supabase.from("projects").select("id", { count: "exact", head: true }),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("status", "published"),
      supabase
        .from("projects")
        .select("id", { count: "exact", head: true })
        .eq("status", "draft"),
      supabase.from("case_studies").select("id", { count: "exact", head: true }),
      supabase.from("ui_shots").select("id", { count: "exact", head: true }),
    ]);

  return {
    totalProjects: projects.count ?? 0,
    publishedProjects: published.count ?? 0,
    draftProjects: drafts.count ?? 0,
    totalCaseStudies: caseStudies.count ?? 0,
    totalUiShots: uiShots.count ?? 0,
  };
}

async function getRecentActivity() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("activity_log")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);
  return data ?? [];
}

export default async function DashboardPage() {
  const [counts, activity] = await Promise.all([
    getCounts(),
    getRecentActivity(),
  ]);

  const stats = [
    { label: "Total projects", value: counts.totalProjects },
    { label: "Published projects", value: counts.publishedProjects },
    { label: "Draft projects", value: counts.draftProjects },
    { label: "Case studies", value: counts.totalCaseStudies },
    { label: "UI shots", value: counts.totalUiShots },
  ];

  return (
    <div className="max-w-4xl">
      <h1 className="font-display text-2xl text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-soft">
        An overview of everything published on the portfolio.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg border border-line bg-surface p-4"
          >
            <div className="font-display text-3xl text-ink">{stat.value}</div>
            <div className="mt-1 text-xs text-ink-soft">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="text-sm font-medium text-ink">Recent activity</h2>
        <div className="mt-3 rounded-lg border border-line bg-surface">
          {activity.length === 0 ? (
            <p className="p-4 text-sm text-ink-faint">
              Nothing yet — changes you make in the dashboard will show up
              here.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {activity.map((item) => (
                <li
                  key={item.id}
                  className="flex items-center justify-between px-4 py-3 text-sm"
                >
                  <span className="text-ink">{item.message}</span>
                  <span className="text-xs text-ink-faint">
                    {timeAgo(item.created_at)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

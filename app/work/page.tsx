import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ProjectCard } from "@/components/public/ProjectCard";
import { getAbout, getSocialLinks, getPublishedProjects } from "@/lib/public-data";

export const metadata = { title: "Work" };

export default async function WorkPage() {
  const [about, socialLinks, projects] = await Promise.all([
    getAbout(),
    getSocialLinks(),
    getPublishedProjects(),
  ]);

  return (
    <>
      <Header name={about?.name ?? ""} />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <h1 className="font-display text-3xl text-ink">Work</h1>
        {projects.length === 0 ? (
          <p className="mt-6 text-sm text-ink-faint">Nothing published yet.</p>
        ) : (
          <div className="mt-8 grid gap-8 sm:grid-cols-2">
            {projects.map((p) => (
              <ProjectCard
                key={p.id}
                slug={p.slug}
                name={p.name}
                shortDescription={p.short_description}
                category={p.category}
                year={p.year}
                thumbnailPath={
                  (p as unknown as { thumbnail: { storage_path: string } | null }).thumbnail
                    ?.storage_path
                }
                projectUrl={p.project_url}
              />
            ))}
          </div>
        )}
      </main>
      <Footer socialLinks={socialLinks} />
    </>
  );
}

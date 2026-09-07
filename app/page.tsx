import Link from "next/link";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { ProjectCard } from "@/components/public/ProjectCard";
import { mediaUrl } from "@/lib/media-url";
import {
  getAbout,
  getSocialLinks,
  getSkills,
  getPublishedProjects,
} from "@/lib/public-data";

export default async function HomePage() {
  const [about, socialLinks, skills, projects] = await Promise.all([
    getAbout(),
    getSocialLinks(),
    getSkills(),
    getPublishedProjects(),
  ]);

  const featured = projects.filter((p) => p.featured).slice(0, 6);
  const shown = featured.length > 0 ? featured : projects.slice(0, 6);
  const profileUrl = mediaUrl(about?.profile_image_path);

  return (
    <>
      <Header name={about?.name ?? ""} />

      <main className="mx-auto max-w-5xl px-6">
        <section id="about" className="grid gap-8 py-16 sm:grid-cols-[1fr_auto] sm:items-start">
          <div>
            {about?.availability_status && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-success-soft px-3 py-1 text-xs text-success">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                {about.availability_status}
              </span>
            )}
            <h1 className="mt-4 font-display text-4xl leading-tight text-ink sm:text-5xl">
              {about?.name}
            </h1>
            <p className="mt-1 text-lg text-ink-soft">
              {about?.role} {about?.location && `· ${about.location}`}
            </p>
            <p className="mt-6 max-w-xl text-ink-soft leading-relaxed">{about?.bio}</p>

            {skills.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {skills.map((s) => (
                  <span key={s.id} className="rounded-full border border-line-strong px-3 py-1 text-xs text-ink-soft">
                    {s.label}
                  </span>
                ))}
              </div>
            )}
          </div>

          {profileUrl && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={profileUrl}
              alt={about?.name ?? ""}
              className="h-32 w-32 shrink-0 rounded-full object-cover sm:h-40 sm:w-40"
            />
          )}
        </section>

        <section className="pb-20">
          <div className="mb-6 flex items-end justify-between">
            <h2 className="font-display text-2xl text-ink">Selected work</h2>
            <Link href="/work" className="text-sm text-accent hover:underline">
              View all →
            </Link>
          </div>

          {shown.length === 0 ? (
            <p className="text-sm text-ink-faint">Nothing published yet.</p>
          ) : (
            <div className="grid gap-8 sm:grid-cols-2">
              {shown.map((p) => (
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
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <Footer socialLinks={socialLinks} />
    </>
  );
}

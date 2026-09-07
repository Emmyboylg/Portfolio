import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { mediaUrl } from "@/lib/media-url";
import { getAbout, getSocialLinks, getUseCaseBySlug } from "@/lib/public-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const result = await getUseCaseBySlug(slug);
  if (!result) return {};
  return {
    title: result.useCase.seo_title || result.useCase.title,
    description: result.useCase.seo_description || result.useCase.short_description,
  };
}

export default async function UseCaseDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [about, socialLinks, result] = await Promise.all([
    getAbout(),
    getSocialLinks(),
    getUseCaseBySlug(slug),
  ]);

  if (!result) notFound();
  const { useCase, images } = result;
  const relatedProject = (useCase as unknown as {
    related_project: { name: string; slug: string } | null;
  }).related_project;

  return (
    <>
      <Header name={about?.name ?? ""} />

      {useCase.status === "draft" && (
        <div className="bg-warning-soft px-6 py-2 text-center text-sm text-warning">
          This is a preview — not publicly visible.
        </div>
      )}

      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl text-ink">{useCase.title}</h1>
        <p className="mt-3 text-lg text-ink-soft">{useCase.short_description}</p>

        {relatedProject && (
          <Link href={`/work/${relatedProject.slug}`} className="mt-2 inline-block text-sm text-accent hover:underline">
            Part of {relatedProject.name} →
          </Link>
        )}

        <div className="mt-10 grid gap-8 sm:grid-cols-2">
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-ink-faint">Problem</h2>
            <p className="mt-2 text-ink-soft leading-relaxed">{useCase.problem}</p>
          </div>
          <div>
            <h2 className="text-xs font-medium uppercase tracking-wide text-ink-faint">Solution</h2>
            <p className="mt-2 text-ink-soft leading-relaxed">{useCase.solution}</p>
          </div>
        </div>

        {images.length > 0 && (
          <div className="mt-10 grid grid-cols-2 gap-3">
            {images.map((img) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={img.id}
                src={mediaUrl(img.storage_path) ?? ""}
                alt=""
                className="aspect-[4/3] w-full rounded-lg object-cover"
              />
            ))}
          </div>
        )}
      </main>

      <Footer socialLinks={socialLinks} />
    </>
  );
}

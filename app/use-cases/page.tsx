import Link from "next/link";
import { Header } from "@/components/public/Header";
import { Footer } from "@/components/public/Footer";
import { getAbout, getSocialLinks, getUseCases } from "@/lib/public-data";

export const metadata = { title: "Use Cases" };

export default async function UseCasesPage() {
  const [about, socialLinks, useCases] = await Promise.all([
    getAbout(),
    getSocialLinks(),
    getUseCases(),
  ]);

  return (
    <>
      <Header name={about?.name ?? ""} />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="font-display text-3xl text-ink">Use Cases</h1>
        <p className="mt-2 text-ink-soft">Specific problems, and how I approached them.</p>

        {useCases.length === 0 ? (
          <p className="mt-8 text-sm text-ink-faint">Nothing published yet.</p>
        ) : (
          <div className="mt-8 divide-y divide-line border-t border-line">
            {useCases.map((uc) => (
              <Link
                key={uc.id}
                href={`/use-cases/${uc.slug}`}
                className="block py-6 hover:bg-paper"
              >
                <h2 className="font-display text-xl text-ink">{uc.title}</h2>
                <p className="mt-1 text-sm text-ink-soft">{uc.short_description}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {uc.tags.map((t: string) => (
                    <span key={t} className="text-xs text-ink-faint">#{t}</span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <Footer socialLinks={socialLinks} />
    </>
  );
}

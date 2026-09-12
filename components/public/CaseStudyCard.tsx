import Link from "next/link";
import { mediaUrl } from "@/lib/media-url";
import { ExternalLink } from "lucide-react";

interface CaseStudyCardProps {
  slug: string;
  title: string;
  summary: string;
  coverPath?: string | null;
  externalUrl?: string | null;
  projectName?: string | null;
}

export function CaseStudyCard({
  slug,
  title,
  summary,
  coverPath,
  externalUrl,
  projectName,
}: CaseStudyCardProps) {
  const url = mediaUrl(coverPath);
  return (
    <div className="group">
      <Link href={`/case-studies/${slug}`} className="block">
        <div className="aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-faint">{title}</div>
          )}
        </div>
      </Link>

      <div className="mt-3 grid grid-cols-[1fr_auto] items-start gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <Link href={`/case-studies/${slug}`}>
              <h3 className="font-display text-lg text-ink group-hover:text-accent">{title}</h3>
            </Link>
            {externalUrl && (
              <a
                href={externalUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-soft transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
                aria-label={`View ${title} on the original platform`}
                title="View original"
              >
                <ExternalLink size={12} strokeWidth={2.75} />
              </a>
            )}
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">{summary}</p>
        </div>
        {projectName && (
          <div className="text-right text-xs text-ink-faint">{projectName}</div>
        )}
      </div>
    </div>
  );
}

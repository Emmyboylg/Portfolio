import Link from "next/link";
import { mediaUrl } from "@/lib/media-url";
import { ExternalLink } from "lucide-react";

interface ProjectCardProps {
  slug: string;
  name: string;
  shortDescription: string;
  category: string | null;
  year: number | null;
  thumbnailPath?: string | null;
  projectUrl?: string | null;
}

export function ProjectCard({
  slug,
  name,
  shortDescription,
  category,
  year,
  thumbnailPath,
  projectUrl,
}: ProjectCardProps) {
  const url = mediaUrl(thumbnailPath);
  return (
    <div className="group">
      <Link href={`/work/${slug}`} className="block">
        <div className="aspect-[4/3] overflow-hidden rounded-lg border border-line bg-surface">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={url}
              alt={name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-ink-faint">{name}</div>
          )}
        </div>
      </Link>

      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Link href={`/work/${slug}`}>
              <h3 className="font-display text-lg text-ink group-hover:text-accent">{name}</h3>
            </Link>
            {projectUrl && (
              <a
                href={projectUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-soft transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
                aria-label={`Open ${name}'s live site`}
                title="Visit live site"
              >
                <ExternalLink size={12} strokeWidth={2.75} />
              </a>
            )}
          </div>
          <p className="mt-0.5 text-sm text-ink-soft">{shortDescription}</p>
        </div>
        <div className="shrink-0 text-right text-xs text-ink-faint">
          {category && <div>{category}</div>}
          {year && <div>{year}</div>}
        </div>
      </div>
    </div>
  );
}

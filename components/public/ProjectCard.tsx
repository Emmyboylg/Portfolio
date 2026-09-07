import Link from "next/link";
import { mediaUrl } from "@/lib/media-url";

interface ProjectCardProps {
  slug: string;
  name: string;
  shortDescription: string;
  category: string | null;
  year: number | null;
  thumbnailPath?: string | null;
}

export function ProjectCard({ slug, name, shortDescription, category, year, thumbnailPath }: ProjectCardProps) {
  const url = mediaUrl(thumbnailPath);
  return (
    <Link href={`/work/${slug}`} className="group block">
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
      <div className="mt-3 flex items-start justify-between gap-2">
        <div>
          <h3 className="font-display text-lg text-ink group-hover:text-accent">{name}</h3>
          <p className="mt-0.5 text-sm text-ink-soft">{shortDescription}</p>
        </div>
        <div className="shrink-0 text-right text-xs text-ink-faint">
          {category && <div>{category}</div>}
          {year && <div>{year}</div>}
        </div>
      </div>
    </Link>
  );
}

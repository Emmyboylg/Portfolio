import type { CaseStudySection, Media } from "@/types/database";
import { mediaUrl } from "@/lib/media-url";

function Img({ media, className }: { media?: Media | null; className?: string }) {
  const url = mediaUrl(media?.storage_path);
  if (!url) return null;
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={url} alt={media?.alt_text ?? ""} className={className} />;
}

export function BlockRenderer({
  block,
  mediaLookup,
}: {
  block: CaseStudySection;
  mediaLookup: Map<string, Media>;
}) {
  const data = block.data as Record<string, unknown>;
  const media = (id: unknown) => (typeof id === "string" ? mediaLookup.get(id) : undefined);

  switch (block.block_type) {
    case "heading": {
      const level = (data.level as number) ?? 2;
      const text = (data.text as string) ?? "";
      if (level === 1) return <h2 className="font-display text-3xl text-ink">{text}</h2>;
      if (level === 3) return <h4 className="font-display text-lg text-ink">{text}</h4>;
      return <h3 className="font-display text-2xl text-ink">{text}</h3>;
    }

    case "paragraph":
      return <p className="text-ink-soft leading-relaxed">{data.text as string}</p>;

    case "image":
      return (
        <figure>
          <Img media={media(data.media_id)} className="w-full rounded-lg" />
          {!!data.caption && <figcaption className="mt-2 text-xs text-ink-faint">{data.caption as string}</figcaption>}
        </figure>
      );

    case "full_width_image":
      return (
        <figure className="-mx-6">
          <Img media={media(data.media_id)} className="w-full" />
          {!!data.caption && <figcaption className="mt-2 px-6 text-xs text-ink-faint">{data.caption as string}</figcaption>}
        </figure>
      );

    case "image_gallery": {
      const ids = (data.media_ids as string[]) ?? [];
      return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {ids.map((id) => (
            <Img key={id} media={mediaLookup.get(id)} className="aspect-square w-full rounded-lg object-cover" />
          ))}
        </div>
      );
    }

    case "video": {
      const m = media(data.media_id);
      const embedUrl = data.embed_url as string;
      const videoUrl = mediaUrl(m?.storage_path);
      return (
        <figure>
          {videoUrl ? (
            <video src={videoUrl} controls className="w-full rounded-lg" />
          ) : embedUrl ? (
            <div className="aspect-video w-full overflow-hidden rounded-lg">
              <iframe src={embedUrl} className="h-full w-full" allowFullScreen />
            </div>
          ) : null}
          {!!data.caption && <figcaption className="mt-2 text-xs text-ink-faint">{data.caption as string}</figcaption>}
        </figure>
      );
    }

    case "quote":
      return (
        <blockquote className="border-l-2 border-accent pl-5">
          <p className="font-display text-xl text-ink">&ldquo;{data.text as string}&rdquo;</p>
          {!!data.attribution && <cite className="mt-2 block text-sm not-italic text-ink-faint">{data.attribution as string}</cite>}
        </blockquote>
      );

    case "statistics": {
      const items = (data.items as { label: string; value: string }[]) ?? [];
      return (
        <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
          {items.map((item, i) => (
            <div key={i}>
              <div className="font-display text-3xl text-accent">{item.value}</div>
              <div className="mt-1 text-xs text-ink-soft">{item.label}</div>
            </div>
          ))}
        </div>
      );
    }

    case "process": {
      const steps = (data.steps as { title: string; description: string }[]) ?? [];
      return (
        <ol className="space-y-4">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-4">
              <span className="font-display text-sm text-accent">{String(i + 1).padStart(2, "0")}</span>
              <div>
                <div className="font-medium text-ink">{step.title}</div>
                <div className="mt-0.5 text-sm text-ink-soft">{step.description}</div>
              </div>
            </li>
          ))}
        </ol>
      );
    }

    case "timeline": {
      const items = (data.items as { date: string; title: string; description: string }[]) ?? [];
      return (
        <ol className="space-y-4 border-l border-line pl-5">
          {items.map((item, i) => (
            <li key={i}>
              <div className="text-xs text-ink-faint">{item.date}</div>
              <div className="font-medium text-ink">{item.title}</div>
              <div className="mt-0.5 text-sm text-ink-soft">{item.description}</div>
            </li>
          ))}
        </ol>
      );
    }

    case "feature":
      return (
        <div className="grid gap-4 sm:grid-cols-2 sm:items-center">
          <Img media={media(data.media_id)} className="w-full rounded-lg" />
          <div>
            <h4 className="font-display text-xl text-ink">{data.title as string}</h4>
            <p className="mt-2 text-sm text-ink-soft">{data.description as string}</p>
          </div>
        </div>
      );

    case "before_after":
      return (
        <figure>
          <div className="grid grid-cols-2 gap-2">
            <Img media={media(data.before_media_id)} className="w-full rounded-lg" />
            <Img media={media(data.after_media_id)} className="w-full rounded-lg" />
          </div>
          {!!data.caption && <figcaption className="mt-2 text-xs text-ink-faint">{data.caption as string}</figcaption>}
        </figure>
      );

    case "design_decision":
      return (
        <div className="rounded-lg bg-accent-soft p-5">
          <div className="text-xs font-medium uppercase tracking-wide text-accent">Design decision</div>
          <h4 className="mt-1 font-display text-lg text-ink">{data.title as string}</h4>
          <p className="mt-2 text-sm text-ink-soft">{data.description as string}</p>
        </div>
      );

    case "text_image": {
      const position = (data.image_position as string) ?? "right";
      return (
        <div className={`grid gap-6 sm:grid-cols-2 sm:items-center ${position === "left" ? "sm:[&>*:first-child]:order-2" : ""}`}>
          <p className="text-ink-soft leading-relaxed">{data.text as string}</p>
          <Img media={media(data.media_id)} className="w-full rounded-lg" />
        </div>
      );
    }

    case "two_column":
      return (
        <div className="grid gap-6 sm:grid-cols-2">
          <p className="text-ink-soft leading-relaxed">{data.left as string}</p>
          <p className="text-ink-soft leading-relaxed">{data.right as string}</p>
        </div>
      );

    default:
      return null;
  }
}

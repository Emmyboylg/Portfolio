import { cn } from "@/lib/utils";

type Tone = "neutral" | "success" | "warning" | "accent";

const tones: Record<Tone, string> = {
  neutral: "bg-paper text-ink-soft border border-line-strong",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  accent: "bg-accent-soft text-accent",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        tones[tone],
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: "draft" | "published" }) {
  return (
    <Badge tone={status === "published" ? "success" : "neutral"}>
      {status === "published" ? "Published" : "Draft"}
    </Badge>
  );
}

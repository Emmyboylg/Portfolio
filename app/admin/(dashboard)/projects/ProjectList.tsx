"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Project } from "@/types/database";
import { mediaUrl } from "@/lib/media-url";
import { SortableList } from "@/components/ui/SortableList";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Button, LinkButton } from "@/components/ui/Button";
import { Input } from "@/components/ui/Field";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  deleteProject,
  duplicateProject,
  reorderProjects,
  toggleProjectStatus,
} from "./actions";
import { Copy, Trash2, Star, ExternalLink } from "lucide-react";

interface ProjectWithThumb extends Project {
  thumbnail_path?: string | null;
}

export function ProjectList({ initialProjects }: { initialProjects: ProjectWithThumb[] }) {
  const [projects, setProjects] = useState(initialProjects);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "draft" | "published">("all");
  const [, startTransition] = useTransition();
  const router = useRouter();

  const filtered = useMemo(
    () =>
      projects.filter((p) => {
        const matchesQuery = p.name.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === "all" || p.status === statusFilter;
        return matchesQuery && matchesStatus;
      }),
    [projects, query, statusFilter]
  );

  const isFiltered = query !== "" || statusFilter !== "all";

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <Input
          placeholder="Search projects…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-xs"
        />
        <div className="flex rounded-md border border-line-strong p-0.5">
          {(["all", "published", "draft"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`rounded px-2.5 py-1 text-xs capitalize ${
                statusFilter === s ? "bg-accent-soft text-accent" : "text-ink-soft hover:text-ink"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <LinkButton href="/admin/projects/new" variant="primary" size="sm">
          Add project
        </LinkButton>
      </div>

      {filtered.length === 0 ? (
        <p className="mt-8 text-sm text-ink-faint">
          {isFiltered ? "No projects match your filters." : "No projects yet — add your first one."}
        </p>
      ) : (
        <div className="mt-4">
          {isFiltered && (
            <p className="mb-2 text-xs text-ink-faint">
              Drag-to-reorder is disabled while filters are active.
            </p>
          )}
          <SortableList
            items={isFiltered ? filtered : projects}
            onReorder={(reordered) => {
              if (isFiltered) return;
              setProjects(reordered);
              startTransition(() => {
                reorderProjects(reordered.map((p) => p.id));
              });
            }}
            renderItem={(project, handle) => (
              <div className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3">
                {!isFiltered && handle}
                <div className="h-14 w-20 shrink-0 overflow-hidden rounded bg-paper">
                  {project.thumbnail_path && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(project.thumbnail_path) ?? ""}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/projects/${project.id}`}
                      className="truncate font-medium text-ink hover:text-accent"
                    >
                      {project.name}
                    </Link>
                    {project.featured && <Star size={13} className="shrink-0 fill-accent text-accent" />}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2">
                    <StatusBadge status={project.status} />
                    {project.category && <Badge>{project.category}</Badge>}
                    {project.year && <span className="text-xs text-ink-faint">{project.year}</span>}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <a
                    href={`/work/${project.slug}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded p-2 text-ink-faint hover:bg-paper hover:text-ink"
                    title="Preview"
                  >
                    <ExternalLink size={15} />
                  </a>
                  <Button
                    size="sm"
                    variant={project.status === "published" ? "secondary" : "primary"}
                    onClick={() =>
                      startTransition(async () => {
                        const res = await toggleProjectStatus(project.id);
                        if ("status" in res) {
                          setProjects((prev) =>
                            prev.map((p) => (p.id === project.id ? { ...p, status: res.status! } : p))
                          );
                        }
                      })
                    }
                  >
                    {project.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <button
                    onClick={() =>
                      startTransition(async () => {
                        const res = await duplicateProject(project.id);
                        if (res.success) router.refresh();
                      })
                    }
                    className="rounded p-2 text-ink-faint hover:bg-paper hover:text-ink"
                    title="Duplicate"
                  >
                    <Copy size={15} />
                  </button>
                  <ConfirmDialog
                    title={`Delete "${project.name}"?`}
                    description="This removes the project and its gallery references. This can't be undone."
                    trigger={(open) => (
                      <button onClick={open} className="rounded p-2 text-ink-faint hover:bg-danger-soft hover:text-danger" title="Delete">
                        <Trash2 size={15} />
                      </button>
                    )}
                    onConfirm={async () => {
                      const res = await deleteProject(project.id);
                      if (res.success) {
                        setProjects((prev) => prev.filter((p) => p.id !== project.id));
                      }
                    }}
                  />
                </div>
              </div>
            )}
          />
        </div>
      )}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { CaseStudy, Project } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { StatusBadge } from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { createCaseStudy, deleteCaseStudy, toggleCaseStudyStatus } from "./actions";
import { Trash2, Plus } from "lucide-react";

export function CaseStudiesClient({
  initialCaseStudies,
  projects,
}: {
  initialCaseStudies: (CaseStudy & { project_name?: string | null })[];
  projects: Project[];
}) {
  const [caseStudies, setCaseStudies] = useState(initialCaseStudies);
  const [newTitle, setNewTitle] = useState("");
  const [newProjectId, setNewProjectId] = useState("");
  const [creating, startCreating] = useTransition();
  const [, startTransition] = useTransition();
  const router = useRouter();

  return (
    <div>
      <div className="flex flex-wrap items-end gap-2 rounded-lg border border-line bg-surface p-4">
        <div className="flex-1">
          <label className="mb-1 block text-xs font-medium text-ink-soft">New case study title</label>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="e.g. Nexura — Campaign Builder"
          />
        </div>
        <div className="w-48">
          <label className="mb-1 block text-xs font-medium text-ink-soft">Project (optional)</label>
          <Select value={newProjectId} onChange={(e) => setNewProjectId(e.target.value)}>
            <option value="">None</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="primary"
          disabled={!newTitle || creating}
          onClick={() =>
            startCreating(() => {
              createCaseStudy({ title: newTitle, project_id: newProjectId || null });
            })
          }
        >
          <Plus size={14} />
          {creating ? "Creating…" : "Create"}
        </Button>
      </div>

      <div className="mt-6 space-y-2">
        {caseStudies.length === 0 ? (
          <p className="text-sm text-ink-faint">No case studies yet.</p>
        ) : (
          caseStudies.map((cs) => (
            <div
              key={cs.id}
              className="flex items-center gap-3 rounded-lg border border-line bg-surface px-3 py-3"
            >
              <div className="min-w-0 flex-1">
                <Link
                  href={`/admin/case-studies/${cs.id}`}
                  className="truncate font-medium text-ink hover:text-accent"
                >
                  {cs.title}
                </Link>
                <div className="mt-0.5 flex items-center gap-2">
                  <StatusBadge status={cs.status} />
                  {cs.project_name && (
                    <span className="text-xs text-ink-faint">{cs.project_name}</span>
                  )}
                </div>
              </div>
              <Button
                size="sm"
                variant={cs.status === "published" ? "secondary" : "primary"}
                onClick={() =>
                  startTransition(async () => {
                    const res = await toggleCaseStudyStatus(cs.id);
                    if ("status" in res) {
                      setCaseStudies((prev) =>
                        prev.map((c) => (c.id === cs.id ? { ...c, status: res.status! } : c))
                      );
                    }
                  })
                }
              >
                {cs.status === "published" ? "Unpublish" : "Publish"}
              </Button>
              <ConfirmDialog
                title={`Delete "${cs.title}"?`}
                description="This removes the case study and all of its content blocks."
                trigger={(open) => (
                  <button
                    onClick={open}
                    className="rounded p-2 text-ink-faint hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
                onConfirm={async () => {
                  const res = await deleteCaseStudy(cs.id);
                  if (res.success) {
                    setCaseStudies((prev) => prev.filter((c) => c.id !== cs.id));
                    router.refresh();
                  }
                }}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

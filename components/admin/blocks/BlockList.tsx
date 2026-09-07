"use client";

import { useState } from "react";
import type { CaseStudySection, Media } from "@/types/database";
import { SortableList } from "@/components/ui/SortableList";
import { BlockDataEditor } from "./BlockDataEditor";
import { BLOCK_DEFINITIONS, getBlockDefinition } from "@/lib/case-study/blocks";
import {
  addBlock,
  deleteBlock,
  duplicateBlock,
  reorderBlocks,
} from "@/app/admin/(dashboard)/case-studies/actions";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { Button } from "@/components/ui/Button";
import { ChevronDown, ChevronUp, Copy, Trash2, Plus } from "lucide-react";
import type { CaseStudyBlockType } from "@/types/database";

export function BlockList({
  caseStudyId,
  initialBlocks,
  mediaLookup,
}: {
  caseStudyId: string;
  initialBlocks: CaseStudySection[];
  mediaLookup: Map<string, Media>;
}) {
  const [blocks, setBlocks] = useState(initialBlocks);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [pickerOpen, setPickerOpen] = useState(false);

  function toggleCollapsed(id: string) {
    setCollapsed((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handleAdd(type: CaseStudyBlockType) {
    setPickerOpen(false);
    const res = await addBlock(caseStudyId, type);
    if (res.block) setBlocks((prev) => [...prev, res.block as CaseStudySection]);
  }

  return (
    <div>
      {blocks.length === 0 ? (
        <p className="rounded-lg border border-dashed border-line-strong p-8 text-center text-sm text-ink-faint">
          No content yet. Add your first block below.
        </p>
      ) : (
        <SortableList
          items={blocks}
          onReorder={(reordered) => {
            setBlocks(reordered);
            reorderBlocks(caseStudyId, reordered.map((b) => b.id));
          }}
          renderItem={(block, handle) => {
            const def = getBlockDefinition(block.block_type);
            const isCollapsed = collapsed.has(block.id);
            return (
              <div className="rounded-lg border border-line bg-surface">
                <div className="flex items-center gap-2 border-b border-line px-3 py-2">
                  {handle}
                  <button
                    onClick={() => toggleCollapsed(block.id)}
                    className="flex flex-1 items-center gap-2 text-left"
                  >
                    <span className="text-sm font-medium text-ink">{def.label}</span>
                    {isCollapsed ? (
                      <ChevronDown size={14} className="text-ink-faint" />
                    ) : (
                      <ChevronUp size={14} className="text-ink-faint" />
                    )}
                  </button>
                  <button
                    onClick={async () => {
                      const res = await duplicateBlock(block.id, caseStudyId);
                      if (res.block) {
                        const idx = blocks.findIndex((b) => b.id === block.id);
                        const next = [...blocks];
                        next.splice(idx + 1, 0, res.block as CaseStudySection);
                        setBlocks(next);
                      }
                    }}
                    className="rounded p-1.5 text-ink-faint hover:bg-paper hover:text-ink"
                    title="Duplicate block"
                  >
                    <Copy size={14} />
                  </button>
                  <ConfirmDialog
                    title="Remove this block?"
                    description="This can't be undone."
                    trigger={(open) => (
                      <button onClick={open} className="rounded p-1.5 text-ink-faint hover:bg-danger-soft hover:text-danger" title="Remove block">
                        <Trash2 size={14} />
                      </button>
                    )}
                    onConfirm={async () => {
                      await deleteBlock(block.id, caseStudyId);
                      setBlocks((prev) => prev.filter((b) => b.id !== block.id));
                    }}
                  />
                </div>
                {!isCollapsed && (
                  <div className="p-4">
                    <BlockDataEditor block={block} mediaLookup={mediaLookup} />
                  </div>
                )}
              </div>
            );
          }}
        />
      )}

      <div className="relative mt-3">
        <Button size="sm" onClick={() => setPickerOpen((v) => !v)}>
          <Plus size={14} />
          Add block
        </Button>
        {pickerOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setPickerOpen(false)} />
            <div className="absolute left-0 top-full z-20 mt-1 grid w-72 grid-cols-1 gap-0.5 rounded-lg border border-line bg-surface p-1.5 shadow-lg">
              {BLOCK_DEFINITIONS.map((def) => (
                <button
                  key={def.type}
                  onClick={() => handleAdd(def.type)}
                  className="rounded-md px-2.5 py-1.5 text-left text-sm text-ink hover:bg-paper"
                >
                  <div className="font-medium">{def.label}</div>
                  <div className="text-xs text-ink-faint">{def.description}</div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

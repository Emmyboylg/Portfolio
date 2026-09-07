"use client";

import { useState, type ReactNode } from "react";
import { Button } from "./Button";

interface ConfirmDialogProps {
  trigger: (open: () => void) => ReactNode;
  title: string;
  description: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
}

// A "confirm before destructive action" dialog. Usage:
// <ConfirmDialog
//   trigger={(open) => <Button onClick={open}>Delete</Button>}
//   title="Delete project?" description="This can't be undone."
//   onConfirm={() => deleteProject(id)}
// />
export function ConfirmDialog({
  trigger,
  title,
  description,
  confirmLabel = "Delete",
  onConfirm,
}: ConfirmDialogProps) {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);

  return (
    <>
      {trigger(() => setOpen(true))}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
          onClick={() => !pending && setOpen(false)}
        >
          <div
            className="w-full max-w-sm rounded-lg bg-surface p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-display text-lg text-ink">{title}</h3>
            <p className="mt-1.5 text-sm text-ink-soft">{description}</p>
            <div className="mt-5 flex justify-end gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="sm"
                disabled={pending}
                onClick={async () => {
                  setPending(true);
                  await onConfirm();
                  setPending(false);
                  setOpen(false);
                }}
              >
                {pending ? "Working…" : confirmLabel}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

interface TagInputProps {
  label: string;
  value: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
}

export function TagInput({ label, value, onChange, placeholder }: TagInputProps) {
  const [draft, setDraft] = useState("");

  function commit() {
    const tag = draft.trim();
    if (tag && !value.includes(tag)) onChange([...value, tag]);
    setDraft("");
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && value.length > 0) {
      onChange(value.slice(0, -1));
    }
  }

  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      <div className="flex min-h-10 flex-wrap items-center gap-1.5 rounded-md border border-line-strong bg-surface px-2 py-1.5 focus-within:ring-2 focus-within:ring-accent/40">
        {value.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-accent-soft px-2 py-0.5 text-xs text-accent"
          >
            {tag}
            <button
              type="button"
              onClick={() => onChange(value.filter((t) => t !== tag))}
              className="hover:text-ink"
            >
              <X size={11} />
            </button>
          </span>
        ))}
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={commit}
          placeholder={value.length === 0 ? placeholder : ""}
          className="min-w-[80px] flex-1 border-none bg-transparent text-sm outline-none placeholder:text-ink-faint"
        />
      </div>
      <span className="mt-1 block text-xs text-ink-faint">
        Press Enter or comma to add.
      </span>
    </div>
  );
}

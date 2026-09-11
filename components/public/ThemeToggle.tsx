"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";

export function ThemeToggle() {
  // Start `null` (unknown) so we render nothing until mounted — avoids a
  // mismatch between the server-rendered markup and whatever the inline
  // theme-init script already applied to <html> before hydration.
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    // One-time read of what the pre-paint inline script already set on
    // <html>, so the button's icon matches reality. Not a derived-state
    // anti-pattern — this is reading external (DOM) state on mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {
      // localStorage can throw in some privacy modes — theme just won't
      // persist across visits, which is a fine fallback.
    }
  }

  if (dark === null) {
    return <span className="inline-block h-8 w-8" aria-hidden />;
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      title={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-line-strong bg-surface text-ink-soft transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent"
    >
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

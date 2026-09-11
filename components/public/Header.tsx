import Link from "next/link";
import { ThemeToggle } from "./ThemeToggle";

export function Header({ name }: { name: string }) {
  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
        <Link href="/" className="font-display text-lg text-ink">
          {name || "Portfolio"}
        </Link>
        <nav className="flex items-center gap-6 text-sm text-ink-soft">
          <Link href="/work" className="hover:text-ink">Work</Link>
          <Link href="/#about" className="hover:text-ink">About</Link>
          <Link href="/#contact" className="hover:text-ink">Contact</Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  FolderKanban,
  BookOpen,
  Image as ImageIcon,
  User,
  Sparkles,
  Briefcase,
  Mail,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { signOut } from "@/app/admin/login/actions";

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/projects", label: "Projects", icon: FolderKanban },
  { href: "/admin/case-studies", label: "Case Studies", icon: BookOpen },
  { href: "/admin/ui-shots", label: "UI Shots", icon: ImageIcon },
  { href: "/admin/about", label: "About", icon: User },
  { href: "/admin/skills", label: "Skills", icon: Sparkles },
  { href: "/admin/experience", label: "Experience", icon: Briefcase },
  { href: "/admin/contact", label: "Contact", icon: Mail },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-60 shrink-0 flex-col border-r border-line bg-surface">
      <div className="px-5 py-5">
        <span className="font-display text-lg text-ink">Studio Admin</span>
      </div>
      <nav className="flex-1 space-y-0.5 px-3">
        {NAV.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active
                  ? "bg-accent-soft text-accent font-medium"
                  : "text-ink-soft hover:bg-paper hover:text-ink"
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-line p-3">
        <form action={signOut}>
          <button
            type="submit"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-ink-soft transition-colors hover:bg-paper hover:text-ink"
          >
            <LogOut size={16} />
            Log out
          </button>
        </form>
      </div>
    </aside>
  );
}

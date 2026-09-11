import type { Metadata } from "next";
import "./globals.css";
import { createClient } from "@/lib/supabase/server";
import { mediaUrl } from "@/lib/media-url";

export async function generateMetadata(): Promise<Metadata> {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .limit(1)
    .maybeSingle();

  const ogImage = settings?.default_og_image_path
    ? mediaUrl(settings.default_og_image_path)
    : undefined;

  return {
    title: {
      default: settings?.site_title || "Portfolio",
      template: `%s — ${settings?.site_title || "Portfolio"}`,
    },
    description: settings?.site_description || "",
    openGraph: ogImage
      ? { images: [{ url: ogImage }] }
      : undefined,
  };
}

const THEME_INIT_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem('theme');
    var dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (dark) document.documentElement.classList.add('dark');
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <head>
        {/* Runs before paint so the site never flashes the wrong theme.
            Admin pages stay light regardless (see .admin-shell in
            globals.css), so this only visibly affects the public site. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

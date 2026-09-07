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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}

import { Sidebar } from "./_components/Sidebar";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Defense in depth: middleware already redirects unauthenticated
  // requests away from /admin/*, but every server render re-checks
  // too, so this still holds even if the middleware matcher changes.
  if (!user) redirect("/admin/login");

  return (
    <div className="flex min-h-screen bg-paper">
      <Sidebar />
      <main className="min-w-0 flex-1 p-8">{children}</main>
    </div>
  );
}

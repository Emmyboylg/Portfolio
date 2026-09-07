import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Use inside Server Components, Server Actions, and Route Handlers.
// This client reads/writes the auth cookie so Supabase RLS correctly
// sees the request as coming from the authenticated admin (or as
// anonymous, for the public site).
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component — safe to ignore
            // because middleware refreshes the session on every request.
          }
        },
      },
    }
  );
}

// SERVER-ONLY. Bypasses RLS with the service role key. Only ever import
// this from server actions / route handlers, never from a client
// component, and never send its result to the browser unfiltered.
export function createServiceRoleClient() {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { cookies: { getAll: () => [], setAll: () => {} } }
  );
}

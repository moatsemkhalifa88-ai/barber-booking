import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Server-side Supabase client bound to the request's cookies, using the
 * publishable (anon) key. Subject to Row Level Security — suitable for
 * Server Components reading public menu data (barbers, services,
 * working_hours). Not used for customer/appointment/contact data; see
 * `service.ts` for the privileged client that handles those.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // Called from a Server Component render; a middleware would be
            // required to persist the refresh, which this app does not need
            // since it has no end-user auth sessions.
          }
        },
      },
    },
  );
}

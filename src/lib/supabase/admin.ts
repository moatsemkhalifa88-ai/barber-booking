import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

/**
 * Privileged, server-only Supabase client using the service_role key, which
 * bypasses Row Level Security entirely. This is what makes the database the
 * final authority on availability and customer data: RLS denies anonymous
 * access to customers/appointments/blocked_times/contact_messages outright,
 * so only this client — instantiated inside Server Actions after the action
 * has validated its own inputs — can read or write them.
 *
 * Import this only from files that run exclusively on the server (Server
 * Actions marked `'use server'`, Route Handlers, Server Components). Never
 * import it from a `'use client'` file: `SUPABASE_SERVICE_ROLE_KEY` has no
 * `NEXT_PUBLIC_` prefix, so Next.js will not inline it into the browser
 * bundle, but the import boundary must still be respected.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "Supabase is not configured: set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local",
    );
  }

  return createSupabaseClient<Database>(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

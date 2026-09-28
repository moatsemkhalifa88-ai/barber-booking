import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/types/database";

/**
 * Browser-safe Supabase client. Uses the publishable (anon) key, which is
 * subject to Row Level Security — it can only read the public menu tables
 * (barbers, services, working_hours). It must never be given the service
 * role key.
 */
export function createClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}

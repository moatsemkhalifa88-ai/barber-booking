import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/env";
import type { BarberOption, ServiceOption } from "@/types/booking";

/** Public menu data, readable under RLS with the anon key. Returns an empty
 * list (rather than throwing) if Supabase is not configured or the query
 * fails, so the homepage still renders while credentials are being set up.
 *
 * Deliberately does not wrap `createClient()` itself in a try/catch: that
 * call reads `cookies()`, which Next.js uses a thrown control-flow signal to
 * detect during static-rendering analysis, and swallowing it would break
 * that detection. Only the query after client creation is guarded. */
export async function getActiveServices(): Promise<ServiceOption[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("services")
      .select("id, name, duration_minutes, price_ils")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("getActiveServices failed:", error.message);
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      durationMinutes: row.duration_minutes,
      priceIls: row.price_ils,
    }));
  } catch (error) {
    console.error("getActiveServices failed:", error);
    return [];
  }
}

export async function getActiveBarbers(): Promise<BarberOption[]> {
  if (!isSupabaseConfigured()) return [];

  const supabase = await createClient();

  try {
    const { data, error } = await supabase
      .from("barbers")
      .select("id, name, role, image_url")
      .eq("is_active", true)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("getActiveBarbers failed:", error.message);
      return [];
    }

    return data.map((row) => ({ id: row.id, name: row.name, role: row.role, imageUrl: row.image_url }));
  } catch (error) {
    console.error("getActiveBarbers failed:", error);
    return [];
  }
}

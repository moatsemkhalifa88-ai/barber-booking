import { createAdminClient } from "@/lib/supabase/admin";
import type { BarberSlotAvailability } from "@/types/booking";

/**
 * Server-authoritative availability for one date/time/service combination.
 * Backed by the `get_barber_availability` SQL function, which is also the
 * function re-run immediately before a booking is inserted — so the UI and
 * the final write both reflect the exact same rules (working hours, blocked
 * times, existing appointments, service duration, past-date checks).
 */
export async function getBarberAvailability(
  date: string,
  timeSlot: string,
  serviceId: string,
): Promise<BarberSlotAvailability[]> {
  const supabase = createAdminClient();

  const [{ data: barbers, error: barbersError }, { data: statusRows, error: statusError }] = await Promise.all([
    supabase
      .from("barbers")
      .select("id, name, role, image_url")
      .eq("is_active", true)
      .order("created_at", { ascending: true }),
    supabase.rpc("get_barber_availability", {
      p_date: date,
      p_time_slot: timeSlot,
      p_service_id: serviceId,
    }),
  ]);

  if (barbersError) throw new Error(`Failed to load barbers: ${barbersError.message}`);
  if (statusError) throw new Error(`Failed to load availability: ${statusError.message}`);

  const statusByBarberId = new Map(statusRows.map((row) => [row.barber_id, row.status]));

  return barbers.map((barber) => ({
    barber: { id: barber.id, name: barber.name, role: barber.role, imageUrl: barber.image_url },
    status: statusByBarberId.get(barber.id) ?? "unavailable",
  }));
}

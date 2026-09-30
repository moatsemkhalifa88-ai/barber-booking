import { createAdminClient } from "@/lib/supabase/admin";
import { TIME_SLOTS } from "@/lib/booking/constants";
import { isPastInShopTimezone } from "@/lib/booking/datetime";
import type { BarberSlotAvailability, DayAvailability, SlotAvailabilityStatus } from "@/types/booking";

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

/** Overall status of a time slot from its barbers' statuses. */
export function summarizeSlotStatus(barbers: BarberSlotAvailability[]): SlotAvailabilityStatus {
  if (barbers.some((entry) => entry.status === "available")) return "available";
  if (barbers.some((entry) => entry.status === "booked")) return "booked";
  return "unavailable";
}

/**
 * Availability for every start time of one day (times that have already
 * passed in shop time are left out). Same SQL function as the per-slot check,
 * so the time grid, the barber list and the final re-check never disagree.
 */
export async function getDayAvailability(date: string, serviceId: string): Promise<DayAvailability> {
  const supabase = createAdminClient();
  const times = TIME_SLOTS.filter((time) => !isPastInShopTimezone(date, time));

  const [{ data: barbers, error: barbersError }, ...statusResults] = await Promise.all([
    supabase.from("barbers").select("id, name, role, image_url").eq("is_active", true).order("created_at", { ascending: true }),
    ...times.map((time) =>
      supabase.rpc("get_barber_availability", { p_date: date, p_time_slot: time, p_service_id: serviceId }),
    ),
  ]);

  if (barbersError) throw new Error(`Failed to load barbers: ${barbersError.message}`);

  const slots = times.map((time, index) => {
    const { data: statusRows, error } = statusResults[index];
    if (error) throw new Error(`Failed to load availability for ${time}: ${error.message}`);
    const statusByBarberId = new Map(statusRows.map((row) => [row.barber_id, row.status]));
    const slotBarbers: BarberSlotAvailability[] = barbers.map((barber) => ({
      barber: { id: barber.id, name: barber.name, role: barber.role, imageUrl: barber.image_url },
      status: statusByBarberId.get(barber.id) ?? "unavailable",
    }));
    return { time, status: summarizeSlotStatus(slotBarbers), barbers: slotBarbers };
  });

  return { date, slots };
}

import { services } from "@/data/services";
import { barbers } from "@/data/barbers";
import type { BarberOption, ServiceOption } from "@/types/booking";

/**
 * Display-only fallback catalog, used so the booking UI still shows its
 * full interactive flow (service/date/time/barber selection) when Supabase
 * is not configured yet, rather than disappearing behind a placeholder
 * message. These ids are not real database rows — `createBookingAction`
 * independently re-validates everything server-side, and the UI disables
 * the final "Confirm Booking" step whenever the backend isn't configured,
 * so a fallback id can never actually reach an insert.
 */
export const FALLBACK_SERVICES: ServiceOption[] = services.map((service) => ({
  id: service.id,
  name: service.name,
  durationMinutes: service.durationMinutes,
  priceIls: service.priceIls,
}));

export const FALLBACK_BARBERS: BarberOption[] = barbers.map((barber) => ({
  id: barber.id,
  name: barber.name,
  role: barber.role,
  imageUrl: barber.image,
}));

import type { AppointmentStatus } from "@/types/database";

export interface ServiceOption {
  id: string;
  name: string;
  durationMinutes: number;
  priceIls: number;
}

export interface BarberOption {
  id: string;
  name: string;
  role: string;
  imageUrl?: string | null;
}

export type SlotAvailabilityStatus = "available" | "booked" | "unavailable";

export interface BarberSlotAvailability {
  barber: BarberOption;
  status: SlotAvailabilityStatus;
}

export interface CreateBookingInput {
  serviceId: string;
  barberId: string;
  date: string; // "YYYY-MM-DD"
  timeSlot: string; // "HH:mm"
  fullName: string;
  phone: string;
  email: string;
  notes?: string;
}

export interface BookingSummary {
  bookingReference: string;
  status: AppointmentStatus;
  date: string;
  startTime: string;
  endTime: string;
  service: ServiceOption;
  barber: BarberOption;
  customerName: string;
  customerEmail: string;
  cancelledAt: string | null;
  /**
   * Whether the customer-facing confirmation/cancellation email actually
   * sent. Only populated by createBookingAction/cancelBookingAction (not by
   * a plain lookup) — undefined there means "not applicable", not "unknown".
   * Resend's sandbox sender can only email the account owner's address until
   * a domain is verified, so this is commonly false in development.
   */
  customerEmailDelivered?: boolean;
}

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getBarberAvailability } from "@/lib/booking/availability";
import { addMinutesToTime, isBookableDate, isPastInShopTimezone, toHourMinute } from "@/lib/booking/datetime";
import { generateBookingReference } from "@/lib/booking/reference";
import { getMissingEnvVars, isDevelopment, isSupabaseConfigured, SUPABASE_ENV_VARS } from "@/lib/env";
import {
  sendBookingCustomerConfirmationEmail,
  sendBookingOwnerNotificationEmail,
  sendCancellationCustomerEmail,
  sendCancellationOwnerNotificationEmail,
} from "@/lib/email/resend";
import type { BookingEmailInput } from "@/lib/email/resend";
import {
  isNonEmptyString,
  isValidDateString,
  isValidEmail,
  isValidPhone,
  isValidTimeString,
  isValidUuid,
} from "@/lib/validation";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary, type Dictionary } from "@/i18n";
import type { ActionResult, BarberSlotAvailability, BookingSummary, CreateBookingInput } from "@/types/booking";

function notConfiguredMessage(dict: Dictionary): string {
  const missing = getMissingEnvVars(SUPABASE_ENV_VARS);
  console.error("Booking backend is not configured. Missing environment variables:", missing.join(", "));
  return isDevelopment
    ? `Development notice: booking is not configured. Missing: ${missing.join(", ")}. Set them in .env.local.`
    : dict.booking.notConfiguredProd;
}

export async function getAvailabilityAction(
  date: string,
  timeSlot: string,
  serviceId: string,
): Promise<ActionResult<BarberSlotAvailability[]>> {
  const dict = getDictionary(await getLocale());

  if (!isValidDateString(date) || !isValidTimeString(timeSlot) || !isValidUuid(serviceId)) {
    return { success: false, error: dict.booking.errors.invalidRequest };
  }
  if (!isBookableDate(date)) {
    return { success: true, data: [] };
  }
  if (!isSupabaseConfigured()) {
    return { success: false, error: notConfiguredMessage(dict) };
  }

  try {
    const data = await getBarberAvailability(date, timeSlot, serviceId);
    return { success: true, data };
  } catch (error) {
    console.error("getAvailabilityAction failed:", error);
    return { success: false, error: dict.booking.errors.generic };
  }
}

function validateCreateBookingInput(input: CreateBookingInput, dict: Dictionary): string | null {
  const { errors } = dict.booking;
  if (!isValidUuid(input.serviceId)) return errors.chooseService;
  if (!isValidUuid(input.barberId)) return errors.chooseBarber;
  if (!isValidDateString(input.date)) return errors.invalidDate;
  if (!isValidTimeString(input.timeSlot)) return errors.invalidTime;
  if (!isNonEmptyString(input.fullName, 200)) return errors.fullName;
  if (!isValidPhone(input.phone)) return errors.phone;
  if (!isValidEmail(input.email)) return errors.email;
  if (input.notes && !isNonEmptyString(input.notes, 1000)) return errors.notesTooLong;
  if (!isBookableDate(input.date)) return errors.closedDay;
  if (isPastInShopTimezone(input.date, input.timeSlot)) return errors.pastTime;
  return null;
}

export async function createBookingAction(input: CreateBookingInput): Promise<ActionResult<BookingSummary>> {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  const validationError = validateCreateBookingInput(input, dict);
  if (validationError) return { success: false, error: validationError };

  if (!isSupabaseConfigured()) {
    return { success: false, error: notConfiguredMessage(dict) };
  }

  const supabase = createAdminClient();

  const { data: service, error: serviceError } = await supabase
    .from("services")
    .select("id, name, duration_minutes, price_ils")
    .eq("id", input.serviceId)
    .eq("is_active", true)
    .maybeSingle();
  if (serviceError) {
    console.error("createBookingAction: service lookup failed:", serviceError.message);
    return { success: false, error: dict.booking.errors.generic };
  }
  if (!service) return { success: false, error: dict.booking.errors.serviceUnavailable };

  const { data: barber, error: barberError } = await supabase
    .from("barbers")
    .select("id, name, role")
    .eq("id", input.barberId)
    .eq("is_active", true)
    .maybeSingle();
  if (barberError) {
    console.error("createBookingAction: barber lookup failed:", barberError.message);
    return { success: false, error: dict.booking.errors.generic };
  }
  if (!barber) return { success: false, error: dict.booking.errors.barberUnavailable };

  // Authoritative re-check, immediately before writing. Never trust the
  // client's earlier availability read.
  const availability = await getBarberAvailability(input.date, input.timeSlot, input.serviceId);
  const chosenBarberStatus = availability.find((entry) => entry.barber.id === input.barberId)?.status;
  if (chosenBarberStatus !== "available") {
    return { success: false, error: dict.booking.errors.slotTaken };
  }

  const endTime = addMinutesToTime(input.timeSlot, service.duration_minutes);
  const normalizedEmail = input.email.trim().toLowerCase();

  const { data: customer, error: customerError } = await supabase
    .from("customers")
    .upsert(
      { full_name: input.fullName.trim(), phone: input.phone.trim(), email: normalizedEmail },
      { onConflict: "email", ignoreDuplicates: false },
    )
    .select("id")
    .single();
  if (customerError || !customer) {
    console.error("createBookingAction: customer upsert failed:", customerError?.message);
    return { success: false, error: dict.booking.errors.generic };
  }

  // Small retry loop: a booking_reference collision is astronomically
  // unlikely (33^8 keyspace) but cheap to guard against.
  for (let attempt = 0; attempt < 3; attempt++) {
    const bookingReference = generateBookingReference();

    const { data: appointment, error: insertError } = await supabase
      .from("appointments")
      .insert({
        customer_id: customer.id,
        barber_id: input.barberId,
        service_id: input.serviceId,
        appointment_date: input.date,
        start_time: input.timeSlot,
        end_time: endTime,
        booking_reference: bookingReference,
        customer_notes: input.notes?.trim() || null,
      })
      .select("booking_reference, status, appointment_date, start_time, end_time, cancelled_at")
      .single();

    if (!insertError && appointment) {
      const emailInput: BookingEmailInput = {
        bookingReference: appointment.booking_reference,
        customerName: input.fullName.trim(),
        customerEmail: normalizedEmail,
        customerPhone: input.phone.trim(),
        serviceName: service.name,
        servicePriceIls: service.price_ils,
        barberName: barber.name,
        date: appointment.appointment_date,
        startTime: toHourMinute(appointment.start_time),
        endTime: toHourMinute(appointment.end_time),
        locale,
      };

      // Never let email delivery affect the booking result — the
      // appointment is already committed at this point. Owner and customer
      // emails are independent: a sandbox-restricted customer send must not
      // suppress the owner notification, or vice versa.
      const [ownerResult, customerResult] = await Promise.all([
        sendBookingOwnerNotificationEmail(emailInput),
        sendBookingCustomerConfirmationEmail(emailInput),
      ]);
      if (!ownerResult.delivered) {
        console.error("createBookingAction: owner notification email failed:", ownerResult.error);
      }
      if (!customerResult.delivered) {
        console.error(
          customerResult.sandboxRestricted
            ? "createBookingAction: customer confirmation email blocked by Resend sandbox restriction (no verified domain)."
            : `createBookingAction: customer confirmation email failed: ${customerResult.error}`,
        );
      }

      return {
        success: true,
        data: {
          bookingReference: appointment.booking_reference,
          status: appointment.status,
          date: appointment.appointment_date,
          startTime: toHourMinute(appointment.start_time),
          endTime: toHourMinute(appointment.end_time),
          service: {
            id: service.id,
            name: service.name,
            durationMinutes: service.duration_minutes,
            priceIls: service.price_ils,
          },
          barber: { id: barber.id, name: barber.name, role: barber.role },
          customerName: input.fullName.trim(),
          customerEmail: normalizedEmail,
          cancelledAt: appointment.cancelled_at,
          customerEmailDelivered: customerResult.delivered,
        },
      };
    }

    // 23505 = unique_violation (booking_reference collision) -> retry.
    // 23P01 = exclusion_violation (a concurrent request just took this slot).
    if (insertError?.code === "23P01") {
      return { success: false, error: dict.booking.errors.slotTaken };
    }
    if (insertError?.code !== "23505") {
      console.error("createBookingAction: insert failed:", insertError?.message);
      return { success: false, error: dict.booking.errors.generic };
    }
  }

  return { success: false, error: dict.booking.errors.generic };
}

async function findAppointmentByReferenceAndEmail(reference: string, email: string) {
  const supabase = createAdminClient();
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedReference = reference.trim().toUpperCase();

  const { data, error } = await supabase
    .from("appointments")
    .select(
      `id, booking_reference, status, appointment_date, start_time, end_time, cancelled_at,
       services ( id, name, duration_minutes, price_ils ),
       barbers ( id, name, role ),
       customers!inner ( full_name, email, phone )`,
    )
    .eq("booking_reference", normalizedReference)
    .eq("customers.email", normalizedEmail)
    .maybeSingle();

  if (error) {
    console.error("findAppointmentByReferenceAndEmail failed:", error.message);
    throw new Error("lookup_failed");
  }

  return data;
}

function toBookingSummary(
  row: NonNullable<Awaited<ReturnType<typeof findAppointmentByReferenceAndEmail>>>,
): BookingSummary {
  return {
    bookingReference: row.booking_reference,
    status: row.status,
    date: row.appointment_date,
    startTime: toHourMinute(row.start_time),
    endTime: toHourMinute(row.end_time),
    service: {
      id: row.services.id,
      name: row.services.name,
      durationMinutes: row.services.duration_minutes,
      priceIls: row.services.price_ils,
    },
    barber: { id: row.barbers.id, name: row.barbers.name, role: row.barbers.role },
    customerName: row.customers.full_name,
    customerEmail: row.customers.email,
    cancelledAt: row.cancelled_at,
  };
}

export async function lookupBookingAction(reference: string, email: string): Promise<ActionResult<BookingSummary>> {
  const dict = getDictionary(await getLocale());

  if (!isNonEmptyString(reference, 20) || !isValidEmail(email)) {
    return { success: false, error: dict.booking.errors.lookupRequired };
  }
  if (!isSupabaseConfigured()) {
    return { success: false, error: notConfiguredMessage(dict) };
  }

  try {
    const row = await findAppointmentByReferenceAndEmail(reference, email);
    if (!row) return { success: false, error: dict.booking.errors.notFound };
    return { success: true, data: toBookingSummary(row) };
  } catch {
    return { success: false, error: dict.booking.errors.generic };
  }
}

export async function cancelBookingAction(reference: string, email: string): Promise<ActionResult<BookingSummary>> {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  if (!isNonEmptyString(reference, 20) || !isValidEmail(email)) {
    return { success: false, error: dict.booking.errors.lookupRequired };
  }
  if (!isSupabaseConfigured()) {
    return { success: false, error: notConfiguredMessage(dict) };
  }

  const normalizedEmail = email.trim().toLowerCase();
  const normalizedReference = reference.trim().toUpperCase();

  let supabase: ReturnType<typeof createAdminClient>;
  let existing;
  try {
    supabase = createAdminClient();
    existing = await findAppointmentByReferenceAndEmail(normalizedReference, normalizedEmail);
  } catch (error) {
    console.error("cancelBookingAction failed:", error);
    return { success: false, error: dict.booking.errors.generic };
  }

  if (!existing) return { success: false, error: dict.booking.errors.notFound };
  if (existing.status === "cancelled") return { success: false, error: dict.booking.errors.alreadyCancelled };
  if (existing.status !== "confirmed") return { success: false, error: dict.booking.errors.cannotCancel };

  // Target by primary key: authorization was already established above via
  // the reference+email lookup. PostgREST does not reliably support filtering
  // an UPDATE's affected rows by an embedded/joined table's column, so the
  // email check must not be the thing restricting this statement's WHERE
  // clause — `existing.id` (unique) is.
  const { data, error } = await supabase
    .from("appointments")
    .update({ status: "cancelled", cancelled_at: new Date().toISOString() })
    .eq("id", existing.id)
    .eq("status", "confirmed") // guards against a concurrent duplicate cancel
    .select(
      `id, booking_reference, status, appointment_date, start_time, end_time, cancelled_at,
       services ( id, name, duration_minutes, price_ils ),
       barbers ( id, name, role ),
       customers!inner ( full_name, email, phone )`,
    )
    .maybeSingle();

  if (error) {
    console.error("cancelBookingAction: update failed:", error.message);
    return { success: false, error: dict.booking.errors.generic };
  }
  if (!data) return { success: false, error: dict.booking.errors.alreadyCancelled };

  const cancelledAt = data.cancelled_at ? new Date(data.cancelled_at) : new Date();
  const emailInput: BookingEmailInput & { cancelledAt: Date } = {
    bookingReference: data.booking_reference,
    customerName: data.customers.full_name,
    customerEmail: data.customers.email,
    customerPhone: data.customers.phone,
    serviceName: data.services.name,
    servicePriceIls: data.services.price_ils,
    barberName: data.barbers.name,
    date: data.appointment_date,
    startTime: toHourMinute(data.start_time),
    endTime: toHourMinute(data.end_time),
    cancelledAt,
    locale,
  };

  const [ownerResult, customerResult] = await Promise.all([
    sendCancellationOwnerNotificationEmail(emailInput),
    sendCancellationCustomerEmail(emailInput),
  ]);
  if (!ownerResult.delivered) {
    console.error("cancelBookingAction: owner notification email failed:", ownerResult.error);
  }
  if (!customerResult.delivered) {
    console.error(
      customerResult.sandboxRestricted
        ? "cancelBookingAction: customer cancellation email blocked by Resend sandbox restriction (no verified domain)."
        : `cancelBookingAction: customer cancellation email failed: ${customerResult.error}`,
    );
  }

  return { success: true, data: { ...toBookingSummary(data), customerEmailDelivered: customerResult.delivered } };
}

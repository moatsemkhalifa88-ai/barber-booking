import type { NextRequest } from "next/server";
import { shopWallTimeToUtc } from "@/lib/booking/datetime";
import { isValidDateString, isValidTimeString } from "@/lib/validation";
import { format, getDictionary, isLocale } from "@/i18n";
import { translateBarberNameForLocale, translateServiceNameForLocale } from "@/i18n/email";

/**
 * "Add to calendar": returns a one-event .ics file for a booking. Stateless —
 * everything comes from the query string and is strictly validated, so no
 * database lookup (and no customer data) is involved. Served as text/calendar
 * so iOS offers "Add to Calendar" directly.
 */

const REFERENCE_PATTERN = /^MOA-[A-Z0-9]{8}$/;
const NAME_PATTERN = /^[\p{L}\p{N} '&.-]{1,60}$/u;

/** RFC 5545 text escaping. */
function escapeIcsText(value: string): string {
  return value.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/,/g, "\\,").replace(/\r?\n/g, "\\n");
}

/** 2026-10-01T09:00:00.000Z -> 20261001T090000Z */
function toIcsUtc(date: Date): string {
  return date.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const date = params.get("date") ?? "";
  const start = params.get("start") ?? "";
  const end = params.get("end") ?? "";
  const reference = params.get("ref") ?? "";
  const service = params.get("service") ?? "";
  const barber = params.get("barber") ?? "";
  const lang = params.get("lang");
  const locale = isLocale(lang) ? lang : "he";

  const isValid =
    isValidDateString(date) &&
    isValidTimeString(start) &&
    isValidTimeString(end) &&
    start < end &&
    REFERENCE_PATTERN.test(reference) &&
    NAME_PATTERN.test(service) &&
    NAME_PATTERN.test(barber);
  if (!isValid) {
    return new Response("Invalid booking details.", { status: 400 });
  }

  const dict = getDictionary(locale);
  const serviceName = translateServiceNameForLocale(service, locale);
  const barberName = translateBarberNameForLocale(barber, locale);

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//MOATSEM//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${reference}@moatsem`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(shopWallTimeToUtc(date, start))}`,
    `DTEND:${toIcsUtc(shopWallTimeToUtc(date, end))}`,
    `SUMMARY:${escapeIcsText(format(dict.booking.calendarTitle, { service: serviceName }))}`,
    `DESCRIPTION:${escapeIcsText(format(dict.booking.calendarDescription, { barber: barberName, reference }))}`,
    "END:VEVENT",
    "END:VCALENDAR",
    "",
  ].join("\r\n");

  return new Response(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `inline; filename="moatsem-${reference}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}

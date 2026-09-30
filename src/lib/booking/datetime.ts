import { BOOKABLE_DAYS_OF_WEEK, SHOP_TIMEZONE, TIME_SLOTS } from "./constants";

// Every "today" / day-of-week decision in the app goes through this module and
// is made in the shop's timezone (Asia/Jerusalem), never the machine's local
// timezone — Vercel servers run in UTC and visitors' phones may be anywhere.
// These functions are pure (safe on server and client), and the ones that
// depend on the current time take an optional `now` for testing.

/** "HH:mm" -> minutes since midnight. */
export function timeToMinutes(time: string): number {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes;
}

/** minutes since midnight -> "HH:mm". */
export function minutesToTime(totalMinutes: number): string {
  const hours = Math.floor(totalMinutes / 60)
    .toString()
    .padStart(2, "0");
  const minutes = (totalMinutes % 60).toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}

export function addMinutesToTime(time: string, minutesToAdd: number): string {
  return minutesToTime(timeToMinutes(time) + minutesToAdd);
}

/**
 * Day of week (0 = Sunday ... 6 = Saturday) for a plain "YYYY-MM-DD" calendar
 * date. A calendar date has no timezone, so this is computed in UTC, which
 * makes the result independent of the machine's local timezone.
 */
export function dayOfWeekForDate(dateString: string): number {
  return new Date(`${dateString}T00:00:00Z`).getUTCDay();
}

/** "YYYY-MM-DD" plus `days` calendar days. */
export function addDaysToDate(dateString: string, days: number): string {
  const date = new Date(`${dateString}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

/** Current wall-clock date/time in the shop's timezone, as "YYYY-MM-DD" / "HH:mm". */
export function nowInShopTimezone(now: Date = new Date()): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    // "h23" (00–23): `hour12: false` can produce "24:05" just after midnight.
    hourCycle: "h23",
  }).formatToParts(now);

  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${lookup.year}-${lookup.month}-${lookup.day}`,
    time: `${lookup.hour}:${lookup.minute}`,
  };
}

/** Whether a given date + "HH:mm" start time has already passed, in shop time. */
export function isPastInShopTimezone(dateString: string, time: string, now: Date = new Date()): boolean {
  const shopNow = nowInShopTimezone(now);
  if (dateString !== shopNow.date) return dateString < shopNow.date;
  return timeToMinutes(time) <= timeToMinutes(shopNow.time);
}

/** Whether the shop is open on this calendar date (Sunday–Thursday). */
export function isBookableDate(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const dayOfWeek = dayOfWeekForDate(dateString);
  return (BOOKABLE_DAYS_OF_WEEK as readonly number[]).includes(dayOfWeek);
}

export interface UpcomingDay {
  date: string;
  dayOfWeek: number;
  isOpen: boolean;
}

/**
 * The next `count` calendar days starting from today in shop time. Today is
 * skipped once its last time slot has started, so the strip never opens on a
 * day that can no longer be booked.
 */
export function upcomingDays(count: number, now: Date = new Date()): UpcomingDay[] {
  const shopNow = nowInShopTimezone(now);
  const lastSlot = TIME_SLOTS[TIME_SLOTS.length - 1];
  const start = timeToMinutes(shopNow.time) >= timeToMinutes(lastSlot) ? addDaysToDate(shopNow.date, 1) : shopNow.date;

  return Array.from({ length: count }, (_, index) => {
    const date = addDaysToDate(start, index);
    return { date, dayOfWeek: dayOfWeekForDate(date), isOpen: isBookableDate(date) };
  });
}

/** Postgres `time` ("HH:mm:ss") -> display "HH:mm". Leaves "HH:mm" unchanged. */
export function toHourMinute(time: string): string {
  return time.slice(0, 5);
}

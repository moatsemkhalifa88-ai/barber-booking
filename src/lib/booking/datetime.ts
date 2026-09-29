import { BOOKABLE_DAYS_OF_WEEK, SHOP_TIMEZONE } from "./constants";

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
 * date. Anchored to UTC midnight so the result does not depend on the
 * server process's local timezone.
 */
export function dayOfWeekForDate(dateString: string): number {
  return new Date(`${dateString}T00:00:00Z`).getUTCDay();
}

/** Current wall-clock date/time in the shop's timezone, as "YYYY-MM-DD" / "HH:mm". */
export function nowInShopTimezone(): { date: string; time: string } {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: SHOP_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(new Date());

  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    date: `${lookup.year}-${lookup.month}-${lookup.day}`,
    time: `${lookup.hour}:${lookup.minute}`,
  };
}

/** Whether a given date + "HH:mm" start time has already passed, in shop time. */
export function isPastInShopTimezone(dateString: string, time: string): boolean {
  const now = nowInShopTimezone();
  if (dateString !== now.date) return dateString < now.date;
  return timeToMinutes(time) <= timeToMinutes(now.time);
}

export function isBookableDate(dateString: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dateString)) return false;
  const dayOfWeek = dayOfWeekForDate(dateString);
  return (BOOKABLE_DAYS_OF_WEEK as readonly number[]).includes(dayOfWeek);
}

/** Postgres `time` ("HH:mm:ss") -> display "HH:mm". Leaves "HH:mm" unchanged. */
export function toHourMinute(time: string): string {
  return time.slice(0, 5);
}

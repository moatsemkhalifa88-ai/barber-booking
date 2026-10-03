import type { Locale } from "@/i18n/config";

const SHOP_TIMEZONE = "Asia/Jerusalem";

const intlLocale = (locale: Locale) => (locale === "he" ? "he-IL" : "en-US");

/**
 * Formats an ILS amount: "50 ₪" in Hebrew, "₪50" in English. No trailing
 * ".00" for whole numbers. Built by hand rather than with Intl currency
 * formatting, which inserts invisible RTL marks around the digits.
 */
export function formatPrice(priceIls: number, locale: Locale): string {
  const amount = Number.isInteger(priceIls) ? String(priceIls) : priceIls.toFixed(2);
  return locale === "he" ? `${amount} ₪` : `₪${amount}`;
}

/** "YYYY-MM-DD" -> a Date at noon UTC, which is the same calendar day in Asia/Jerusalem all year round. */
function calendarDate(dateString: string): Date {
  return new Date(`${dateString}T12:00:00Z`);
}

/** UI date: "יום ה׳, 1 באוקטובר" / "Thu, Oct 1". */
export function formatDate(dateString: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "short",
    day: "numeric",
    month: locale === "he" ? "long" : "short",
    timeZone: SHOP_TIMEZONE,
  }).format(calendarDate(dateString));
}

/** Email date: "יום חמישי, 1 באוקטובר 2026" / "Thursday, October 1, 2026". */
export function formatDateLong(dateString: string, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: SHOP_TIMEZONE,
  }).format(calendarDate(dateString));
}

/** Date-strip chip parts: { weekday: "יום ה׳", day: "1 באוק׳" } / { weekday: "Thu", day: "Oct 1" }. */
export function formatDateChip(dateString: string, locale: Locale): { weekday: string; day: string } {
  const date = calendarDate(dateString);
  return {
    weekday: new Intl.DateTimeFormat(intlLocale(locale), { weekday: "short", timeZone: SHOP_TIMEZONE }).format(date),
    day: new Intl.DateTimeFormat(intlLocale(locale), { day: "numeric", month: "short", timeZone: SHOP_TIMEZONE }).format(date),
  };
}

/** An instant (e.g. submitted/cancelled at) in shop time: "יום חמישי, 1 באוקטובר 2026, 16:05". */
export function formatInstant(instant: Date, locale: Locale): string {
  return new Intl.DateTimeFormat(intlLocale(locale), {
    dateStyle: "full",
    timeStyle: "short",
    hourCycle: "h23",
    timeZone: SHOP_TIMEZONE,
  }).format(instant);
}

/**
 * Price split for display typography: the amount in the display face, the ₪
 * sign smaller in the body face. `symbolFirst` follows formatPrice ("₪50" in
 * English, "50 ₪" in Hebrew); render inside an LTR-isolated span.
 */
export function priceParts(priceIls: number, locale: Locale): { amount: string; symbol: string; symbolFirst: boolean } {
  const amount = Number.isInteger(priceIls) ? String(priceIls) : priceIls.toFixed(2);
  return { amount, symbol: "₪", symbolFirst: locale === "en" };
}

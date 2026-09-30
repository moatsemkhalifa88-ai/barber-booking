export const locales = ["en", "he"] as const;

export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "he";

export const LOCALE_COOKIE = "MOATSEM_LOCALE";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (locales as readonly string[]).includes(value);
}

export function dirForLocale(locale: Locale): "ltr" | "rtl" {
  return locale === "he" ? "rtl" : "ltr";
}

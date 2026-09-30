import { getDictionary } from "./index";
import type { Locale } from "./config";

/** Owner notifications (new booking, cancellation, contact message) are always sent in Hebrew. */
export const OWNER_EMAIL_LOCALE: Locale = "he";

/** Email strings for a locale. They live in the dictionaries (`email` section) so all copy has one source. */
export function getEmailStrings(locale: Locale) {
  return getDictionary(locale).email;
}

/** Localized service name for a known English DB service name, falling back to the original. */
export function translateServiceNameForLocale(name: string, locale: Locale): string {
  return getDictionary(locale).services.nameByEnglish[name] ?? name;
}

/** Localized barber name for a known English DB barber name, falling back to the original. */
export function translateBarberNameForLocale(name: string, locale: Locale): string {
  return getDictionary(locale).barbers.nameByEnglish[name] ?? name;
}

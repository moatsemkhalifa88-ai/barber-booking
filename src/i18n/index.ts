import { en } from "./en";
import { he } from "./he";
import type { Locale } from "./config";

export type { Dictionary } from "./en";
export { locales, defaultLocale, isLocale, dirForLocale, LOCALE_COOKIE, LOCALE_COOKIE_MAX_AGE } from "./config";
export type { Locale } from "./config";

const dictionaries = { en, he };

export function getDictionary(locale: Locale) {
  return dictionaries[locale];
}

/** Replaces `{key}` placeholders in a dictionary string with values, e.g. format(dict.contact.receivedBody, { name: "Dana" }). */
export function format(template: string, values: Record<string, string>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => values[key] ?? match);
}

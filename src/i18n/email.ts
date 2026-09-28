import { getDictionary } from "./index";
import type { Locale } from "./config";

/**
 * Strings for the customer-facing booking emails (confirmation, cancellation).
 * Owner-notification emails intentionally stay in English — see AGENTS.md
 * requirement #11 — so they don't need translation here.
 */
function buildEmailStrings(locale: Locale) {
  if (locale === "he") {
    return {
      labels: {
        bookingReference: "מספר הזמנה",
        customer: "לקוח",
        email: 'דוא"ל',
        phone: "טלפון",
        service: "שירות",
        barber: "ספר",
        date: "תאריך",
        time: "שעה",
        cancelledAt: "בוטל בתאריך",
      },
      confirmedTitle: "התור שלך ב-MOATSEM אושר",
      confirmedSubject: (date: string, time: string) => `התור אושר — ${date} בשעה ${time}`,
      confirmedNote:
        "שמרו את מספר ההזמנה — תזדקקו לו, יחד עם כתובת האימייל הזו, כדי לאתר או לבטל את התור.",
      cancelledTitle: "התור שלך ב-MOATSEM בוטל",
      cancelledSubject: (date: string, time: string) => `התור בוטל — ${date} בשעה ${time}`,
      cancelledNote: "השעה הזו זמינה כעת שוב אם תרצו לקבוע תור חדש.",
      dir: "rtl" as const,
      lang: "he" as const,
    };
  }

  return {
    labels: {
      bookingReference: "Booking reference",
      customer: "Customer",
      email: "Email",
      phone: "Phone",
      service: "Service",
      barber: "Barber",
      date: "Date",
      time: "Time",
      cancelledAt: "Cancelled at",
    },
    confirmedTitle: "Your MOATSEM appointment is confirmed",
    confirmedSubject: (date: string, time: string) => `Booking confirmed — ${date} at ${time}`,
    confirmedNote:
      "Keep your booking reference — you'll need it, along with this email address, to look up or cancel your appointment.",
    cancelledTitle: "Your MOATSEM appointment was cancelled",
    cancelledSubject: (date: string, time: string) => `Booking cancelled — ${date} at ${time}`,
    cancelledNote: "That time is now available again if you'd like to rebook.",
    dir: "ltr" as const,
    lang: "en" as const,
  };
}

export function getEmailStrings(locale: Locale) {
  return buildEmailStrings(locale);
}

/** Looks up the Hebrew service name for a known English DB service name, falling back to the original. */
export function translateServiceNameForLocale(name: string, locale: Locale): string {
  return getDictionary(locale).services.nameByEnglish[name] ?? name;
}

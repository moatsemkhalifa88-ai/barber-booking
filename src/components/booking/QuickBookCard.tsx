"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { BOOK_SERVICE_EVENT, type BookServiceEventDetail } from "@/components/booking/BookingWidget";
import { services } from "@/data/services";
import { upcomingDays } from "@/lib/booking/datetime";
import { formatDate } from "@/lib/format";
import { useLocale } from "@/i18n/LocaleProvider";

/**
 * Hero quick-booking card: pick a service and a day, then "Book" jumps into
 * the booking flow at step 2 with both pre-selected. Native <select>s so
 * phones show their own pickers. Without JavaScript the form simply links to
 * the booking section.
 */
export function QuickBookCard() {
  const { locale, dict } = useLocale();
  const t = dict.hero;

  // Open days in shop time (Asia/Jerusalem) — the same list the booking flow shows.
  const openDays = useMemo(() => upcomingDays(14).filter((day) => day.isOpen), []);
  const [serviceName, setServiceName] = useState(services[0].name);
  const [date, setDate] = useState(openDays[0]?.date ?? "");

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    window.dispatchEvent(new CustomEvent<BookServiceEventDetail>(BOOK_SERVICE_EVENT, { detail: { serviceName, date } }));
  }

  return (
    <form
      action="#booking"
      onSubmit={handleSubmit}
      aria-labelledby="quick-book-title"
      className="tone-light flex w-full flex-col gap-3 rounded-lg bg-surface p-4 text-fg sm:p-5 lg:max-w-lg"
    >
      <p id="quick-book-title" className="text-sm font-bold text-accent">
        {t.quickBookTitle}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="quick-book-service" className="text-sm font-semibold">
            {t.quickBookService}
          </label>
          <select
            id="quick-book-service"
            value={serviceName}
            onChange={(event) => setServiceName(event.target.value)}
            className="field field-select"
          >
            {services.map((service) => (
              <option key={service.id} value={service.name}>
                {dict.services.items[service.id]?.name ?? service.name}
              </option>
            ))}
          </select>
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <label htmlFor="quick-book-day" className="text-sm font-semibold">
            {t.quickBookDay}
          </label>
          <select id="quick-book-day" value={date} onChange={(event) => setDate(event.target.value)} className="field field-select">
            {openDays.map((day) => (
              <option key={day.date} value={day.date}>
                {formatDate(day.date, locale)}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div data-hero-actions>
        <Button type="submit" variant="primary" className="w-full">
          {t.quickBookCta}
        </Button>
      </div>
    </form>
  );
}

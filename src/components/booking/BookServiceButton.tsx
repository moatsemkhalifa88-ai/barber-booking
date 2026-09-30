"use client";

import { Button } from "@/components/ui/Button";
import { BOOK_SERVICE_EVENT, type BookServiceEventDetail } from "@/components/booking/BookingWidget";

/**
 * "Book this service": pre-selects the service in the booking flow and jumps
 * straight to choosing a day and time. Without JavaScript it is still a plain
 * link to the booking section.
 */
export function BookServiceButton({ serviceName, label }: { serviceName: string; label: string }) {
  return (
    <Button
      href="#booking"
      variant="secondary"
      className="service-card__cta mt-1 w-full"
      onClick={(event) => {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent<BookServiceEventDetail>(BOOK_SERVICE_EVENT, { detail: { serviceName } }));
      }}
    >
      {label}
    </Button>
  );
}

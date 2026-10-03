"use client";

import type { ReactNode } from "react";
import { BOOK_SERVICE_EVENT, type BookServiceEventDetail } from "@/components/booking/BookingWidget";

/**
 * "Book this service" link: pre-selects the service in the booking flow and
 * jumps straight to choosing a day and time. Without JavaScript it is still a
 * plain link to the booking section. Used for whole price-list rows.
 */
export function BookServiceLink({
  serviceName,
  className = "",
  ariaLabel,
  children,
}: {
  serviceName: string;
  className?: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  return (
    <a
      href="#booking"
      aria-label={ariaLabel}
      className={className}
      onClick={(event) => {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent<BookServiceEventDetail>(BOOK_SERVICE_EVENT, { detail: { serviceName } }));
      }}
    >
      {children}
    </a>
  );
}

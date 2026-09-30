"use client";

import { useTransition } from "react";
import { useState } from "react";
import { cancelBookingAction, lookupBookingAction } from "@/lib/booking/actions";
import { Button } from "@/components/ui/Button";
import { Bidi } from "@/components/ui/Bidi";
import { formatDate, formatPrice } from "@/lib/format";
import { useLocale } from "@/i18n/LocaleProvider";
import type { BookingSummary } from "@/types/booking";

export function ManageBookingForm() {
  const { locale, dict } = useLocale();
  const translateServiceName = (name: string) => dict.services.nameByEnglish[name] ?? name;

  const [reference, setReference] = useState("");
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);

  const [isLookingUp, startLookupTransition] = useTransition();
  const [isCancelling, startCancelTransition] = useTransition();

  function handleLookup(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setCancelMessage(null);
    setBooking(null);

    startLookupTransition(() => {
      lookupBookingAction(reference, email).then((result) => {
        if (result.success) {
          setBooking(result.data);
        } else {
          setError(result.error);
        }
      });
    });
  }

  function handleCancel() {
    setError(null);
    setCancelMessage(null);

    startCancelTransition(() => {
      cancelBookingAction(reference, email).then((result) => {
        if (result.success) {
          setBooking(result.data);
          setCancelMessage(
            result.data.customerEmailDelivered === false
              ? dict.manageBooking.cancelledMessageEmailFailed
              : dict.manageBooking.cancelledMessage,
          );
        } else {
          setError(result.error);
        }
      });
    });
  }

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-8">
      <form
        onSubmit={handleLookup}
        className="flex flex-col gap-4 rounded-3xl border border-border bg-surface p-6 sm:p-8"
      >
        <label className="flex flex-col gap-2 text-sm text-muted">
          {dict.manageBooking.referenceLabel}
          <input
            required
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder={dict.manageBooking.referencePlaceholder}
            className="field"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-muted">
          {dict.manageBooking.emailLabel}
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field"
          />
        </label>

        {error ? <p className="text-sm text-error">{error}</p> : null}

        <Button type="submit" variant="primary" disabled={isLookingUp}>
          {isLookingUp ? dict.manageBooking.lookingUp : dict.manageBooking.findBooking}
        </Button>
      </form>

      {booking ? (
        <div className="flex flex-col gap-5 rounded-2xl border border-accent bg-surface-2 p-6 sm:p-8">
          <div className="flex items-center justify-between gap-4 border-b border-border pb-4">
            <span className="text-xs font-semibold text-accent">
              <Bidi>{booking.bookingReference}</Bidi>
            </span>
            <span
              className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                booking.status === "confirmed"
                  ? "border-accent bg-accent-soft text-accent"
                  : "border-border text-muted"
              }`}
            >
              {dict.manageBooking.statusLabels[booking.status]}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <dt className="text-muted">{dict.booking.serviceLabel}</dt>
              <dd className="text-fg">{translateServiceName(booking.service.name)}</dd>
            </div>
            <div>
              <dt className="text-muted">{dict.booking.barberLabel}</dt>
              <dd className="text-fg">{dict.barbers.nameByEnglish[booking.barber.name] ?? booking.barber.name}</dd>
            </div>
            <div>
              <dt className="text-muted">{dict.booking.dateLabel}</dt>
              <dd className="text-fg">
                {formatDate(booking.date, locale)}
              </dd>
            </div>
            <div>
              <dt className="text-muted">{dict.booking.timeLabel}</dt>
              <dd className="text-fg">
                <Bidi>
                  {booking.startTime}–{booking.endTime}
                </Bidi>
              </dd>
            </div>
            <div>
              <dt className="text-muted">{dict.booking.priceLabel}</dt>
              <dd className="text-accent">
                <Bidi>{formatPrice(booking.service.priceIls, locale)}</Bidi>
              </dd>
            </div>
          </dl>

          {cancelMessage ? <p className="text-sm text-accent">{cancelMessage}</p> : null}

          {booking.status === "confirmed" ? (
            <Button
              type="button"
              variant="secondary"
              onClick={handleCancel}
              disabled={isCancelling}
              className="border-error text-error hover:border-error hover:text-error"
            >
              {isCancelling ? dict.manageBooking.cancelling : dict.manageBooking.cancelAppointment}
            </Button>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button href="/#booking" variant="primary" className="flex-1">
                {dict.manageBooking.bookAnotherAppointment}
              </Button>
              <Button href="/" variant="secondary" className="flex-1">
                {dict.manageBooking.backToHomeCta}
              </Button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}

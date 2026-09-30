"use client";

import { useRef, useState, useTransition } from "react";
import { cancelBookingAction, lookupBookingAction } from "@/lib/booking/actions";
import { Button } from "@/components/ui/Button";
import { Bidi } from "@/components/ui/Bidi";
import { FormField } from "@/components/ui/FormField";
import { AlertIcon, CheckIcon, SearchIcon } from "@/components/ui/Icons";
import { formatDate, formatPrice } from "@/lib/format";
import { useLocale } from "@/i18n/LocaleProvider";
import type { BookingSummary } from "@/types/booking";

export function ManageBookingForm({ initialReference = "" }: { initialReference?: string }) {
  const { locale, dict } = useLocale();
  const t = dict.manageBooking;
  const translateServiceName = (name: string) => dict.services.nameByEnglish[name] ?? name;
  const translateBarberName = (name: string) => dict.barbers.nameByEnglish[name] ?? name;

  const [reference, setReference] = useState(initialReference);
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<BookingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cancelMessage, setCancelMessage] = useState<string | null>(null);
  const [isConfirmingCancel, setIsConfirmingCancel] = useState(false);

  const [isLookingUp, startLookupTransition] = useTransition();
  const [isCancelling, startCancelTransition] = useTransition();
  const resultRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLDivElement>(null);

  function handleLookup(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setCancelMessage(null);
    setIsConfirmingCancel(false);
    setBooking(null);

    startLookupTransition(() => {
      lookupBookingAction(reference, email).then((result) => {
        if (result.success) {
          setBooking(result.data);
          requestAnimationFrame(() => resultRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" }));
        } else {
          setError(result.error);
        }
      });
    });
  }

  function askToCancel() {
    setIsConfirmingCancel(true);
    requestAnimationFrame(() => confirmRef.current?.focus());
  }

  function handleCancel() {
    setError(null);
    setCancelMessage(null);

    startCancelTransition(() => {
      cancelBookingAction(reference, email).then((result) => {
        setIsConfirmingCancel(false);
        if (result.success) {
          setBooking(result.data);
          setCancelMessage(result.data.customerEmailDelivered === false ? t.cancelledMessageEmailFailed : t.cancelledMessage);
        } else {
          setError(result.error);
        }
      });
    });
  }

  const rows: [string, React.ReactNode][] = booking
    ? [
        [dict.booking.serviceLabel, translateServiceName(booking.service.name)],
        [dict.booking.barberLabel, translateBarberName(booking.barber.name)],
        [dict.booking.dateLabel, formatDate(booking.date, locale)],
        [dict.booking.timeLabel, <Bidi key="time">{`${booking.startTime}–${booking.endTime}`}</Bidi>],
        [dict.booking.priceLabel, <Bidi key="price">{formatPrice(booking.service.priceIls, locale)}</Bidi>],
      ]
    : [];

  return (
    <div className="flex w-full flex-col gap-6">
      <form onSubmit={handleLookup} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-6">
        <FormField
          label={t.referenceLabel}
          helper={t.referenceHelp}
          required
          dir="ltr"
          autoCapitalize="characters"
          autoComplete="off"
          spellCheck={false}
          placeholder={t.referencePlaceholder}
          value={reference}
          onChange={(event) => setReference(event.target.value.toUpperCase())}
        />
        <FormField
          label={t.emailLabel}
          required
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          dir="ltr"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />

        {error ? (
          <p role="alert" className="flex items-start gap-2 rounded-lg bg-error-soft p-3 text-sm font-semibold text-error">
            <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
            {error}
          </p>
        ) : null}

        <Button type="submit" variant="primary" disabled={isLookingUp} loading={isLookingUp} className="w-full">
          {isLookingUp ? null : <SearchIcon className="h-5 w-5" />}
          {isLookingUp ? t.lookingUp : t.findBooking}
        </Button>
      </form>

      {booking ? (
        <div ref={resultRef} className="flex flex-col gap-4 rounded-lg border border-border bg-surface p-4 shadow-card sm:p-6">
          <div className="flex items-center justify-between gap-3 border-b border-border pb-3">
            <span dir="ltr" className="text-lg font-bold tracking-wider text-fg tabular-nums">
              {booking.bookingReference}
            </span>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px] font-semibold ${
                booking.status === "confirmed" ? "bg-success-soft text-success" : "bg-surface-2 text-disabled-fg"
              }`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
              {t.statusLabels[booking.status]}
            </span>
          </div>

          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-base">
            {rows.map(([label, value]) => (
              <div key={label} className="flex flex-col">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="font-semibold text-fg">{value}</dd>
              </div>
            ))}
          </dl>

          {cancelMessage ? (
            <p role="status" className="flex items-start gap-2 rounded-lg bg-success-soft p-3 text-sm font-semibold text-success">
              <CheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
              {cancelMessage}
            </p>
          ) : null}

          {booking.status === "confirmed" && !isConfirmingCancel ? (
            <Button variant="danger" onClick={askToCancel} className="w-full">
              {t.cancelAppointment}
            </Button>
          ) : null}

          {booking.status === "confirmed" && isConfirmingCancel ? (
            <div
              ref={confirmRef}
              tabIndex={-1}
              role="group"
              aria-labelledby="cancel-confirm-title"
              className="flex flex-col gap-3 rounded-lg border border-error bg-error-soft p-4 outline-none"
            >
              <p id="cancel-confirm-title" className="text-lg font-bold text-fg">
                {t.cancelConfirmTitle}
              </p>
              <p className="text-base text-fg">{t.cancelConfirmBody}</p>
              <div className="grid gap-3 sm:grid-cols-2">
                <Button variant="dangerSolid" onClick={handleCancel} disabled={isCancelling} loading={isCancelling}>
                  {isCancelling ? t.cancelling : t.cancelConfirmYes}
                </Button>
                <Button variant="secondary" onClick={() => setIsConfirmingCancel(false)} disabled={isCancelling}>
                  {t.cancelConfirmNo}
                </Button>
              </div>
            </div>
          ) : null}

          {booking.status !== "confirmed" ? (
            <Button href="/#booking" variant="primary" className="w-full">
              {t.bookAnotherAppointment}
            </Button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Bidi } from "@/components/ui/Bidi";
import { createBookingAction, getAvailabilityAction } from "@/lib/booking/actions";
import { FALLBACK_BARBERS } from "@/lib/booking/fallback-data";
import { BOOKABLE_DAYS_OF_WEEK, TIME_SLOTS } from "@/lib/booking/constants";
import { formatPrice } from "@/lib/format";
import { useLocale } from "@/i18n/LocaleProvider";
import { format } from "@/i18n";
import type { BarberSlotAvailability, BookingSummary, ServiceOption } from "@/types/booking";
import type { DayId } from "@/types";

interface BookingWidgetProps {
  services: ServiceOption[];
  isBookingConfigured: boolean;
}

const DAY_IDS: DayId[] = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];

const NOT_CONFIGURED_MESSAGE_DEV =
  "Development notice: this is a UI preview only — either Supabase env vars are missing (set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env.local) or the services table doesn't match the app's expected schema yet (check for pending migrations). See the server console for the exact error.";

function toDateValue(date: Date): string {
  // Local calendar date, not toISOString() (which is UTC and can land on a
  // different calendar day than getDay()'s local weekday near midnight).
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function nextBookableDates(
  count: number,
  dayShortLabels: Record<DayId, string>,
  dateLocale: string,
): { value: string; label: string; weekday: string }[] {
  const dates: { value: string; label: string; weekday: string }[] = [];
  const cursor = new Date();

  while (dates.length < count) {
    const dayOfWeek = cursor.getDay();
    if ((BOOKABLE_DAYS_OF_WEEK as readonly number[]).includes(dayOfWeek)) {
      dates.push({
        value: toDateValue(cursor),
        label: cursor.toLocaleDateString(dateLocale, { month: "short", day: "numeric" }),
        weekday: dayShortLabels[DAY_IDS[dayOfWeek]],
      });
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return dates;
}

type Step = "select" | "details" | "confirmed";

export function BookingWidget({ services, isBookingConfigured }: BookingWidgetProps) {
  const { locale, dict } = useLocale();
  const dateLocale = locale === "he" ? "he-IL" : "en-US";
  const dayShortLabels = useMemo(() => {
    const entries = Object.entries(dict.workingHours.days) as [DayId, { label: string; short: string }][];
    return Object.fromEntries(entries.map(([id, day]) => [id, day.short])) as Record<DayId, string>;
  }, [dict]);

  const bookableDates = useMemo(
    () => nextBookableDates(14, dayShortLabels, dateLocale),
    [dayShortLabels, dateLocale],
  );
  const isDev = process.env.NODE_ENV === "development";

  const [serviceId, setServiceId] = useState<string>(services[0]?.id ?? "");
  const [date, setDate] = useState<string>(bookableDates[0]?.value ?? "");
  const [timeSlot, setTimeSlot] = useState<string>(TIME_SLOTS[4]);
  const [barberId, setBarberId] = useState<string | null>(null);

  const [availability, setAvailability] = useState<BarberSlotAvailability[]>([]);
  const [isLoadingAvailability, startAvailabilityTransition] = useTransition();
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("select");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");

  const [isSubmitting, startSubmitTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingSummary | null>(null);

  const translateServiceName = (name: string) => dict.services.nameByEnglish[name] ?? name;
  const translateBarberRole = (role: string) => dict.barbers.roleByEnglish[role] ?? role;

  const selectedService = services.find((service) => service.id === serviceId);

  // Reset the chosen barber whenever the service/date/time selection
  // changes, following React's recommended "adjust state during render"
  // pattern instead of an effect (see react.dev/learn/you-might-not-need-an-effect).
  const selectionKey = `${serviceId}|${date}|${timeSlot}`;
  const [previousSelectionKey, setPreviousSelectionKey] = useState(selectionKey);
  if (selectionKey !== previousSelectionKey) {
    setPreviousSelectionKey(selectionKey);
    setBarberId(null);
  }

  // No backend to check against yet: show the real barber roster as a pure,
  // synchronous preview so every step of the flow remains usable — no fetch
  // needed, so this stays out of the effect below entirely. Only the final
  // submit is blocked (see handleReviewSubmit).
  const fallbackAvailability = useMemo(
    () => FALLBACK_BARBERS.map((barber) => ({ barber, status: "available" as const })),
    [],
  );

  useEffect(() => {
    if (!isBookingConfigured) return;
    if (!serviceId || !date || !timeSlot) return;

    startAvailabilityTransition(() => {
      getAvailabilityAction(date, timeSlot, serviceId).then((result) => {
        if (result.success) {
          setAvailability(result.data);
          setAvailabilityError(null);
        } else {
          setAvailability([]);
          setAvailabilityError(result.error);
        }
      });
    });
  }, [serviceId, date, timeSlot, isBookingConfigured]);

  const displayAvailability = isBookingConfigured ? availability : fallbackAvailability;
  const selectedBarber = displayAvailability.find((entry) => entry.barber.id === barberId)?.barber;

  function handleReviewSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSubmitError(null);

    if (!isBookingConfigured) {
      setSubmitError(isDev ? NOT_CONFIGURED_MESSAGE_DEV : dict.booking.notConfiguredProd);
      return;
    }

    if (!barberId || !serviceId || !date || !timeSlot) {
      setSubmitError(dict.booking.errors.completeAllSteps);
      return;
    }

    startSubmitTransition(() => {
      createBookingAction({
        serviceId,
        barberId,
        date,
        timeSlot,
        fullName,
        phone,
        email,
        notes: notes || undefined,
      }).then((result) => {
        if (result.success) {
          setConfirmation(result.data);
          setStep("confirmed");
        } else {
          setSubmitError(result.error);
        }
      });
    });
  }

  if (step === "confirmed" && confirmation) {
    return (
      <section id="booking" className="scroll-mt-24 border-b border-line/80 bg-charcoal">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-6 px-6 py-24 text-center sm:px-8 lg:px-12 lg:py-32">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-full border border-gold/60 bg-gold/10 text-2xl text-gold-light">
            ✓
          </span>
          <h2 className="font-display text-3xl text-cream sm:text-4xl">{dict.booking.confirmedHeading}</h2>
          <p className="text-muted">
            {format(dict.booking.confirmedBody, { name: confirmation.customerName })}
          </p>

          <div className="mt-2 flex flex-col gap-4 rounded-2xl border border-gold/40 bg-ink p-6 text-start sm:p-8">
            <div className="flex items-center justify-between gap-4 border-b border-line/80 pb-4">
              <span className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                {dict.booking.referenceLabel}
              </span>
              <span className="font-display text-xl text-gold-light">
                <Bidi>{confirmation.bookingReference}</Bidi>
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-muted">{dict.booking.serviceLabel}</dt>
                <dd className="text-cream">{translateServiceName(confirmation.service.name)}</dd>
              </div>
              <div>
                <dt className="text-muted">{dict.booking.barberLabel}</dt>
                <dd className="text-cream">{confirmation.barber.name}</dd>
              </div>
              <div>
                <dt className="text-muted">{dict.booking.dateLabel}</dt>
                <dd className="text-cream">
                  <Bidi>{confirmation.date}</Bidi>
                </dd>
              </div>
              <div>
                <dt className="text-muted">{dict.booking.timeLabel}</dt>
                <dd className="text-cream">
                  <Bidi>
                    {confirmation.startTime}–{confirmation.endTime}
                  </Bidi>
                </dd>
              </div>
              <div>
                <dt className="text-muted">{dict.booking.priceLabel}</dt>
                <dd className="text-gold-light">
                  <Bidi>{formatPrice(confirmation.service.priceIls)}</Bidi>
                </dd>
              </div>
            </dl>
          </div>

          {confirmation.customerEmailDelivered === false ? (
            <p className="max-w-md rounded-lg border border-gold/40 bg-gold/5 px-4 py-3 text-xs text-gold-light">
              {dict.booking.emailFailedNotice}
            </p>
          ) : null}

          <p className="text-xs text-muted">
            {dict.booking.manageBookingHint}{" "}
            <a href="/manage-booking" className="text-gold-light underline underline-offset-4">
              {dict.booking.manageBookingLinkText}
            </a>{" "}
            {dict.booking.manageBookingHintSuffix}
          </p>
        </div>
      </section>
    );
  }

  return (
    <section id="booking" className="scroll-mt-24 border-b border-line/80 bg-charcoal">
      <div className="mx-auto flex max-w-7xl flex-col gap-12 px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <SectionHeading
          eyebrow={dict.booking.eyebrow}
          title={dict.booking.title}
          description={dict.booking.description}
        />

        {!isBookingConfigured && isDev ? (
          <p className="mx-auto max-w-2xl rounded-xl border border-gold/40 bg-gold/5 px-4 py-3 text-center text-xs text-gold-light">
            {NOT_CONFIGURED_MESSAGE_DEV}
          </p>
        ) : null}

        {step === "select" ? (
          <div className="grid gap-8 rounded-3xl border border-line bg-ink p-6 sm:p-8 lg:grid-cols-[1fr_1.3fr] lg:p-10">
            <div className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                  {dict.booking.stepChooseService}
                </h3>
                <div role="group" aria-label={dict.booking.selectServiceGroup} className="flex flex-col gap-2">
                  {services.map((service) => {
                    const isSelected = service.id === serviceId;
                    return (
                      <button
                        key={service.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setServiceId(service.id)}
                        className={`flex items-center justify-between rounded-xl border px-4 py-3 text-start text-sm font-medium transition-colors duration-200 ${
                          isSelected
                            ? "border-gold bg-gold/10 text-cream"
                            : "border-line text-muted hover:border-gold/50 hover:text-gold-light"
                        }`}
                      >
                        <span>{translateServiceName(service.name)}</span>
                        <span className="flex items-center gap-2 text-xs text-muted">
                          <Bidi>
                            {service.durationMinutes} {dict.services.minutesSuffix}
                          </Bidi>
                          <span className="text-gold-light">
                            <Bidi>{formatPrice(service.priceIls)}</Bidi>
                          </span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                  {dict.booking.stepChooseDay}
                </h3>
                <div role="group" aria-label={dict.booking.selectDayGroup} className="flex flex-wrap gap-2">
                  {bookableDates.map((day) => {
                    const isSelected = day.value === date;
                    return (
                      <button
                        key={day.value}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setDate(day.value)}
                        className={`flex min-w-16 flex-col items-center rounded-xl border px-3 py-2 text-sm font-medium transition-colors duration-200 ${
                          isSelected
                            ? "border-gold bg-gold text-ink"
                            : "border-line text-muted hover:border-gold/50 hover:text-gold-light"
                        }`}
                      >
                        <span className="text-xs uppercase opacity-80">{day.weekday}</span>
                        <span>{day.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                  {dict.booking.stepChooseTime}
                </h3>
                <div role="group" aria-label={dict.booking.selectTimeGroup} className="grid grid-cols-3 gap-2 sm:grid-cols-4 lg:grid-cols-3">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = slot === timeSlot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => setTimeSlot(slot)}
                        className={`rounded-lg border px-3 py-2.5 text-sm font-medium transition-colors duration-200 ${
                          isSelected
                            ? "border-gold bg-gold text-ink"
                            : "border-line text-muted hover:border-gold/50 hover:text-gold-light"
                        }`}
                      >
                        <Bidi>{slot}</Bidi>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-5 rounded-2xl border border-line bg-charcoal p-6 sm:p-7">
              <div className="flex flex-col gap-1 border-b border-line/80 pb-5">
                <h3 className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                  {dict.booking.stepChooseBarber}
                </h3>
                <p className="font-display text-lg text-cream">
                  <Bidi>
                    {date} — {timeSlot}
                  </Bidi>
                </p>
              </div>

              {isLoadingAvailability ? (
                <p className="text-sm text-muted">{dict.booking.checkingAvailability}</p>
              ) : availabilityError ? (
                <p className="text-sm text-red-400">{availabilityError}</p>
              ) : displayAvailability.length === 0 ? (
                <p className="text-sm text-muted">{dict.booking.closedDayMessage}</p>
              ) : (
                <ul className="flex flex-col gap-3">
                  {displayAvailability.map(({ barber, status }) => {
                    const isBookable = status === "available";
                    const isSelected = barberId === barber.id;
                    const statusLabel = dict.booking.statusLabels[status];

                    return (
                      <li key={barber.id}>
                        <button
                          type="button"
                          disabled={!isBookable}
                          aria-pressed={isSelected}
                          aria-label={`${barber.name}, ${statusLabel}`}
                          onClick={() => setBarberId(barber.id)}
                          className={`flex w-full items-center justify-between gap-4 rounded-xl border px-4 py-3.5 text-start transition-colors duration-200 ${
                            !isBookable
                              ? "border-line/60 bg-ink/40"
                              : isSelected
                                ? "border-gold bg-gold/10"
                                : "border-line bg-ink hover:border-gold/50"
                          } disabled:cursor-not-allowed`}
                        >
                          <span className="flex items-center gap-3">
                            <span
                              className="relative h-10 w-10 shrink-0 overflow-hidden rounded-full border border-line bg-charcoal-light"
                              aria-hidden="true"
                            >
                              {barber.imageUrl ? (
                                <Image src={barber.imageUrl} alt="" fill sizes="40px" className="object-cover" />
                              ) : null}
                            </span>
                            <span className="flex flex-col">
                              <span className={`text-sm font-semibold ${isBookable ? "text-cream" : "text-muted"}`}>
                                {barber.name}
                              </span>
                              <span className="text-xs text-muted">{translateBarberRole(barber.role)}</span>
                            </span>
                          </span>
                          <StatusBadge status={status} label={statusLabel} />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}

              <Button
                type="button"
                variant="primary"
                className="mt-2 w-full disabled:opacity-40"
                disabled={!barberId}
                onClick={() => setStep("details")}
              >
                {dict.booking.continue}
              </Button>
            </div>
          </div>
        ) : (
          <form
            onSubmit={handleReviewSubmit}
            className="mx-auto flex w-full max-w-2xl flex-col gap-6 rounded-3xl border border-line bg-ink p-6 sm:p-8 lg:p-10"
          >
            <div className="flex flex-col gap-1 border-b border-line/80 pb-5">
              <h3 className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
                {dict.booking.stepYourDetails}
              </h3>
              <p className="font-display text-lg text-cream">
                {translateServiceName(selectedService?.name ?? "")} {dict.booking.withConnector} {selectedBarber?.name}{" "}
                <Bidi>
                  — {date} {dict.booking.atConnector} {timeSlot}
                </Bidi>
              </p>
              {selectedService ? (
                <p className="text-sm text-gold-light">
                  <Bidi>{formatPrice(selectedService.priceIls)}</Bidi>
                </p>
              ) : null}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-2 text-sm text-muted">
                {dict.booking.fullNameLabel}
                <input
                  required
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="rounded-lg border border-line bg-charcoal px-4 py-2.5 text-cream focus-visible:outline-2 focus-visible:outline-gold"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm text-muted">
                {dict.booking.phoneLabel}
                <input
                  required
                  type="tel"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  className="rounded-lg border border-line bg-charcoal px-4 py-2.5 text-cream focus-visible:outline-2 focus-visible:outline-gold"
                />
              </label>
            </div>

            <label className="flex flex-col gap-2 text-sm text-muted">
              {dict.booking.emailLabel}
              <input
                required
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="rounded-lg border border-line bg-charcoal px-4 py-2.5 text-cream focus-visible:outline-2 focus-visible:outline-gold"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm text-muted">
              {dict.booking.notesLabel}
              <textarea
                rows={3}
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                className="resize-none rounded-lg border border-line bg-charcoal px-4 py-2.5 text-cream focus-visible:outline-2 focus-visible:outline-gold"
              />
            </label>

            {!isBookingConfigured ? (
              <p className="rounded-lg border border-gold/40 bg-gold/5 px-4 py-3 text-sm text-gold-light">
                {isDev ? NOT_CONFIGURED_MESSAGE_DEV : dict.booking.notConfiguredProd}
              </p>
            ) : null}

            {submitError ? <p className="text-sm text-red-400">{submitError}</p> : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="button"
                variant="secondary"
                className="sm:w-40"
                onClick={() => setStep("select")}
                disabled={isSubmitting}
              >
                {dict.booking.back}
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex-1 disabled:opacity-40"
                disabled={isSubmitting || !isBookingConfigured}
              >
                {isSubmitting ? dict.booking.confirming : dict.booking.confirmBooking}
              </Button>
            </div>
          </form>
        )}
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Button } from "@/components/ui/Button";
import { Bidi } from "@/components/ui/Bidi";
import { FormField } from "@/components/ui/FormField";
import { AlertIcon, BackIcon, BoltIcon, CalendarIcon, CheckIcon, CopyIcon, ForwardIcon, UsersIcon } from "@/components/ui/Icons";
import { createBookingAction, getDayAvailabilityAction, getEarliestAvailableAction } from "@/lib/booking/actions";
import { FALLBACK_BARBERS } from "@/lib/booking/fallback-data";
import { ANY_BARBER, TIME_SLOTS } from "@/lib/booking/constants";
import { isPastInShopTimezone, upcomingDays } from "@/lib/booking/datetime";
import { formatDate, formatDateChip, formatPrice } from "@/lib/format";
import { isNonEmptyString, isValidEmail, isValidPhone } from "@/lib/validation";
import { useLocale } from "@/i18n/LocaleProvider";
import { format } from "@/i18n";
import type { BookingSummary, DayAvailability, ServiceOption, TimeSlotAvailability } from "@/types/booking";

interface BookingWidgetProps {
  services: ServiceOption[];
  isBookingConfigured: boolean;
}

/** Fired by "Book this service" buttons and the hero quick-booking card (see BookServiceButton, QuickBookCard). */
export const BOOK_SERVICE_EVENT = "moatsem:book-service";
/** `date` ("YYYY-MM-DD", shop time) is optional; when given and open, it is pre-selected too. */
export type BookServiceEventDetail = { serviceName: string; date?: string };

const NOT_CONFIGURED_MESSAGE_DEV =
  "Development notice: this is a UI preview only — either Supabase env vars are missing (set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY, and SUPABASE_SERVICE_ROLE_KEY in .env.local) or the services table doesn't match the app's expected schema yet (check for pending migrations). See the server console for the exact error.";

const TOTAL_STEPS = 4;
type Step = 1 | 2 | 3 | 4;
type DetailField = "fullName" | "phone" | "email" | "notes";
type Details = Record<DetailField, string>;
const DETAIL_FIELDS: DetailField[] = ["fullName", "phone", "email", "notes"];

const chipBase =
  "flex cursor-pointer flex-col items-center justify-center rounded-sm border text-center transition-colors duration-150 disabled:cursor-not-allowed";
const chipIdle = "border-border-strong bg-surface text-fg hover:border-fg";
const chipSelected = "border-primary bg-primary text-on-primary";
const chipDisabled = "border-transparent bg-surface-2 text-disabled-fg";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function BookingWidget({ services, isBookingConfigured }: BookingWidgetProps) {
  const { locale, dict } = useLocale();
  const t = dict.booking;
  const isDev = process.env.NODE_ENV === "development";

  const translateServiceName = (name: string) => dict.services.nameByEnglish[name] ?? name;
  const translateBarberName = (name: string) => dict.barbers.nameByEnglish[name] ?? name;
  const translateBarberRole = (role: string) => dict.barbers.roleByEnglish[role] ?? role;

  // Next 14 calendar days in shop time (Asia/Jerusalem) — identical on the server render and in the browser.
  const days = useMemo(
    () => upcomingDays(14).map((day) => ({ ...day, ...formatDateChip(day.date, locale) })),
    [locale],
  );

  const [step, setStep] = useState<Step>(1);
  const [serviceId, setServiceId] = useState<string | null>(null);
  const [date, setDate] = useState<string>(() => days.find((day) => day.isOpen)?.date ?? days[0].date);
  const [time, setTime] = useState<string | null>(null);
  const [barberId, setBarberId] = useState<string | null>(null);

  const [dayCache, setDayCache] = useState<Record<string, { data?: DayAvailability; error?: string }>>({});
  const [, startDayTransition] = useTransition();
  const [isSearchingEarliest, startEarliestTransition] = useTransition();
  const [earliestMessage, setEarliestMessage] = useState<string | null>(null);

  const [details, setDetails] = useState<Details>({ fullName: "", phone: "", email: "", notes: "" });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<DetailField, string>>>({});
  const [isSubmitting, startSubmitTransition] = useTransition();
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [confirmation, setConfirmation] = useState<BookingSummary | null>(null);

  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  const selectedService = services.find((service) => service.id === serviceId) ?? null;
  const dayKey = serviceId ? `${serviceId}|${date}` : null;

  // ---------------------------------------------------------------------------
  // Availability for the selected day (fetched once per service + day).
  // ---------------------------------------------------------------------------

  const fallbackDay = useMemo<DayAvailability>(
    () => ({
      date,
      slots: TIME_SLOTS.filter((slot) => !isPastInShopTimezone(date, slot)).map((slot) => ({
        time: slot,
        status: "available" as const,
        barbers: FALLBACK_BARBERS.map((barber) => ({ barber, status: "available" as const })),
      })),
    }),
    [date],
  );

  const isClosedDay = !days.find((day) => day.date === date)?.isOpen;
  const cached = dayKey ? dayCache[dayKey] : undefined;
  const dayData: DayAvailability | undefined = isClosedDay
    ? { date, slots: [] }
    : isBookingConfigured
      ? cached?.data
      : fallbackDay;
  const dayError = isBookingConfigured ? cached?.error : undefined;
  const isDayLoading = step >= 2 && !isClosedDay && !dayData && !dayError;

  useEffect(() => {
    if (!isBookingConfigured || step < 2 || !serviceId || !dayKey || isClosedDay || dayCache[dayKey]) return;
    startDayTransition(() => {
      getDayAvailabilityAction(date, serviceId).then((result) => {
        setDayCache((previous) => ({
          ...previous,
          [dayKey]: result.success ? { data: result.data } : { error: result.error },
        }));
      });
    });
  }, [isBookingConfigured, step, serviceId, date, dayKey, isClosedDay, dayCache]);

  const selectedSlot: TimeSlotAvailability | undefined = dayData?.slots.find((slot) => slot.time === time);
  const barberOptions = selectedSlot?.barbers ?? [];
  const isAnyBarberAvailable = barberOptions.some((entry) => entry.status === "available");

  // ---------------------------------------------------------------------------
  // Navigation between steps: scroll the flow into view and focus the new heading.
  // ---------------------------------------------------------------------------

  // A counter rather than "step changed": a price row or the quick-booking card
  // must still bring the flow into view when it is already on step 2.
  const [revealRequest, setRevealRequest] = useState(0);

  const goToStep = useCallback((next: Step) => {
    setStep(next);
    setRevealRequest((count) => count + 1);
  }, []);

  useEffect(() => {
    if (revealRequest === 0) return;
    sectionRef.current?.scrollIntoView({ block: "start", behavior: prefersReducedMotion() ? "auto" : "smooth" });
    headingRef.current?.focus({ preventScroll: true });
  }, [revealRequest]);

  // "Book this service" buttons elsewhere on the page pre-select a service and jump to step 2.
  useEffect(() => {
    function handleBookService(event: Event) {
      const { serviceName, date: requestedDate } = (event as CustomEvent<BookServiceEventDetail>).detail;
      const service = services.find((candidate) => candidate.name === serviceName);
      if (!service) return;
      setConfirmation(null);
      setServiceId(service.id);
      if (requestedDate && days.some((day) => day.date === requestedDate && day.isOpen)) setDate(requestedDate);
      setTime(null);
      setBarberId(null);
      setEarliestMessage(null);
      goToStep(2);
    }
    window.addEventListener(BOOK_SERVICE_EVENT, handleBookService);
    return () => window.removeEventListener(BOOK_SERVICE_EVENT, handleBookService);
  }, [services, days, goToStep]);

  // ---------------------------------------------------------------------------
  // Selections.
  // ---------------------------------------------------------------------------

  function chooseService(id: string) {
    setServiceId(id);
    setTime(null);
    setBarberId(null);
    setEarliestMessage(null);
  }

  function chooseDate(next: string) {
    setDate(next);
    setTime(null);
    setBarberId(null);
    setEarliestMessage(null);
  }

  function chooseTime(next: string) {
    setTime(next);
    setBarberId(null);
  }

  function findEarliest() {
    if (!serviceId) return;
    setEarliestMessage(null);

    if (!isBookingConfigured) {
      const day = days.find((candidate) => candidate.isOpen && TIME_SLOTS.some((slot) => !isPastInShopTimezone(candidate.date, slot)));
      if (day) {
        chooseDate(day.date);
        setTime(TIME_SLOTS.find((slot) => !isPastInShopTimezone(day.date, slot)) ?? null);
      }
      return;
    }

    startEarliestTransition(() => {
      getEarliestAvailableAction(serviceId).then((result) => {
        if (result.success && result.data) {
          setDate(result.data.date);
          setTime(result.data.time);
          setBarberId(null);
          document.getElementById(`day-${result.data.date}`)?.scrollIntoView({ block: "nearest", inline: "center" });
        } else {
          setEarliestMessage(result.success ? t.noEarliest : result.error);
        }
      });
    });
  }

  // ---------------------------------------------------------------------------
  // Details form.
  // ---------------------------------------------------------------------------

  function validateField(field: DetailField, value: string): string | undefined {
    if (field === "fullName" && !isNonEmptyString(value, 200)) return t.errors.fullName;
    if (field === "phone" && !isValidPhone(value)) return t.errors.phone;
    if (field === "email" && !isValidEmail(value)) return t.errors.email;
    if (field === "notes" && value && !isNonEmptyString(value, 1000)) return t.errors.notesTooLong;
    return undefined;
  }

  function updateDetail(field: DetailField, value: string) {
    setDetails((previous) => ({ ...previous, [field]: value }));
    // Clear an existing error as soon as the value becomes valid; new errors wait for blur/submit.
    if (fieldErrors[field] && !validateField(field, value)) {
      setFieldErrors((previous) => ({ ...previous, [field]: undefined }));
    }
  }

  function blurDetail(field: DetailField) {
    if (field !== "notes" && !details[field]) return; // don't nag about fields not filled in yet
    setFieldErrors((previous) => ({ ...previous, [field]: validateField(field, details[field]) }));
  }

  function submitBooking() {
    setSubmitError(null);
    const errors: Partial<Record<DetailField, string>> = {};
    for (const field of DETAIL_FIELDS) {
      const error = validateField(field, details[field]);
      if (error) errors[field] = error;
    }
    setFieldErrors(errors);
    const firstInvalid = DETAIL_FIELDS.find((field) => errors[field]);
    if (firstInvalid) {
      document.getElementById(`booking-${firstInvalid}`)?.focus();
      return;
    }

    if (!isBookingConfigured) {
      setSubmitError(isDev ? NOT_CONFIGURED_MESSAGE_DEV : t.notConfiguredProd);
      return;
    }
    if (!serviceId || !time || !barberId) {
      setSubmitError(t.errors.completeAllSteps);
      return;
    }

    startSubmitTransition(() => {
      createBookingAction({
        serviceId,
        barberId,
        date,
        timeSlot: time,
        fullName: details.fullName,
        phone: details.phone,
        email: details.email,
        notes: details.notes || undefined,
      }).then((result) => {
        if (result.success) {
          setConfirmation(result.data);
          setRevealRequest((count) => count + 1);
        } else {
          setSubmitError(result.error);
          // The slot may have just been taken: refetch this day the next time it is shown.
          if (dayKey) {
            setDayCache((previous) => {
              const next = { ...previous };
              delete next[dayKey];
              return next;
            });
          }
        }
      });
    });
  }

  function startOver() {
    setConfirmation(null);
    setServiceId(null);
    setTime(null);
    setBarberId(null);
    setDetails({ fullName: "", phone: "", email: "", notes: "" });
    setFieldErrors({});
    setSubmitError(null);
    setDayCache({});
    goToStep(1);
  }

  // ---------------------------------------------------------------------------
  // Step bar (summary, price, back / next).
  // ---------------------------------------------------------------------------

  const canContinue =
    step === 1 ? !!serviceId : step === 2 ? selectedSlot?.status === "available" : step === 3 ? !!barberId : true;
  const selectedBarber = barberOptions.find((entry) => entry.barber.id === barberId)?.barber;
  const barberSummary = barberId === ANY_BARBER ? t.anyBarber : selectedBarber ? translateBarberName(selectedBarber.name) : null;
  // Second line of the step bar: short date, time and barber once chosen ("יום ד׳ 30 בספט׳ · 14:00 · כל ספר פנוי").
  const selectedDay = days.find((day) => day.date === date);
  const whenParts = [
    step >= 2 && selectedDay ? `${selectedDay.weekday} ${selectedDay.day}` : null,
    step >= 2 ? time : null,
    step >= 3 ? barberSummary : null,
  ].filter(Boolean);

  const stepTitles: Record<Step, string> = {
    1: t.stepChooseService,
    2: t.stepChooseDateTime,
    3: t.stepChooseBarber,
    4: t.stepYourDetails,
  };

  // ---------------------------------------------------------------------------
  // Render: confirmation.
  // ---------------------------------------------------------------------------

  if (confirmation) {
    return (
      <section ref={sectionRef} id="booking" className="section-y bg-surface">
        <div className="container-page flex max-w-2xl flex-col gap-5">
          <BookingConfirmation confirmation={confirmation} headingRef={headingRef} onStartOver={startOver} />
        </div>
      </section>
    );
  }

  // ---------------------------------------------------------------------------
  // Render: steps.
  // ---------------------------------------------------------------------------

  return (
    <section ref={sectionRef} id="booking" className="section-y bg-surface">
      <div className="container-page flex flex-col gap-6 lg:gap-10">
        <SectionHeading eyebrow={t.eyebrow} title={t.title} description={t.description} />

        {!isBookingConfigured && isDev ? (
          <p className="mx-auto max-w-2xl rounded-lg border border-accent bg-accent-soft px-4 py-3 text-center text-sm text-fg">
            {NOT_CONFIGURED_MESSAGE_DEV}
          </p>
        ) : null}

        <div className="mx-auto w-full max-w-3xl rounded-lg border border-border bg-canvas">
          {/* Progress */}
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:p-6">
            <p className="text-sm font-semibold text-muted">
              {format(t.stepCounter, { current: String(step), total: String(TOTAL_STEPS) })}
            </p>
            <div className="flex gap-1.5" aria-hidden="true">
              {Array.from({ length: TOTAL_STEPS }, (_, index) => (
                <span
                  key={index}
                  className={`h-1.5 flex-1 rounded-full transition-colors duration-200 ${index < step ? "bg-primary" : "bg-surface-2"}`}
                />
              ))}
            </div>
            <h3 ref={headingRef} tabIndex={-1} className="font-display text-[34px] leading-[0.95] font-bold text-fg outline-none">
              {stepTitles[step]}
            </h3>
          </div>

          <div className="p-4 sm:p-6">
            {step === 1 ? (
              <div role="group" aria-label={t.selectServiceGroup} className="flex flex-col gap-3">
                {services.map((service) => {
                  const isSelected = service.id === serviceId;
                  return (
                    <button
                      key={service.id}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => chooseService(service.id)}
                      className={`flex min-h-16 w-full cursor-pointer items-center gap-3 rounded-lg border-2 p-4 text-start transition-colors duration-150 ${
                        isSelected ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-border-strong"
                      }`}
                    >
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          isSelected ? "border-accent bg-accent text-on-primary" : "border-border-strong"
                        }`}
                      >
                        {isSelected ? <CheckIcon className="h-4 w-4" /> : null}
                      </span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <span className="text-lg font-bold text-fg">{translateServiceName(service.name)}</span>
                        <span className="text-sm text-muted">
                          <bdi>
                            {service.durationMinutes} {dict.services.minutesSuffix}
                          </bdi>
                        </span>
                      </span>
                      <span className="text-lg font-bold whitespace-nowrap text-accent tabular-nums">
                        <Bidi>{formatPrice(service.priceIls, locale)}</Bidi>
                      </span>
                    </button>
                  );
                })}
              </div>
            ) : null}

            {step === 2 ? (
              <div className="flex flex-col gap-5">
                {/* Date strip: swipeable on phones; closed days stay visible but disabled and labelled. */}
                <div role="group" aria-label={t.selectDayGroup} className="swipe-row [--gutter:0px] sm:flex-wrap">
                  {days.map((day) => {
                    const isSelected = day.date === date;
                    return (
                      <button
                        key={day.date}
                        id={`day-${day.date}`}
                        type="button"
                        disabled={!day.isOpen}
                        aria-pressed={isSelected}
                        onClick={() => chooseDate(day.date)}
                        className={`${chipBase} h-[68px] w-[76px] gap-0.5 ${
                          !day.isOpen ? chipDisabled : isSelected ? chipSelected : chipIdle
                        }`}
                      >
                        <span className="text-sm font-bold">{day.weekday}</span>
                        <span className="text-[13px]">{day.isOpen ? day.day : dict.workingHours.closedLabel}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-base font-bold text-fg">{formatDate(date, locale)}</p>
                  <Button variant="ghost" onClick={findEarliest} disabled={isSearchingEarliest}>
                    <BoltIcon className="h-4 w-4" />
                    {isSearchingEarliest ? t.searchingEarliest : t.earliestAvailable}
                  </Button>
                </div>
                {earliestMessage ? (
                  <p role="status" className="text-sm font-semibold text-muted">
                    {earliestMessage}
                  </p>
                ) : null}

                {/* Time grid */}
                {isDayLoading ? (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-5" aria-busy="true" aria-label={t.checkingAvailability}>
                    {Array.from({ length: 6 }, (_, index) => (
                      <span key={index} className="h-14 animate-pulse rounded-sm bg-surface-2" />
                    ))}
                  </div>
                ) : dayError ? (
                  <p role="alert" className="flex items-center gap-2 text-sm font-semibold text-error">
                    <AlertIcon className="h-4 w-4" />
                    {dayError}
                  </p>
                ) : isClosedDay ? (
                  <p className="text-base text-muted">{t.closedDayMessage}</p>
                ) : !dayData?.slots.some((slot) => slot.status === "available") ? (
                  <p className="rounded-lg bg-surface-2 p-4 text-base text-fg">{t.noSlotsForDay}</p>
                ) : (
                  <div role="group" aria-label={t.selectTimeGroup} className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                    {dayData.slots.map((slot) => {
                      const isSelected = slot.time === time;
                      const isAvailable = slot.status === "available";
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!isAvailable}
                          aria-pressed={isSelected}
                          onClick={() => chooseTime(slot.time)}
                          className={`${chipBase} h-14 ${!isAvailable ? chipDisabled : isSelected ? chipSelected : chipIdle}`}
                        >
                          <span className={`text-base font-bold tabular-nums ${!isAvailable ? "line-through decoration-1" : ""}`}>
                            <Bidi>{slot.time}</Bidi>
                          </span>
                          {!isAvailable ? <span className="text-xs font-semibold">{t.statusLabels[slot.status]}</span> : null}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : null}

            {step === 3 ? (
              <ul aria-label={t.selectBarberGroup} className="flex flex-col gap-3">
                <li>
                  <button
                    type="button"
                    disabled={!isAnyBarberAvailable}
                    aria-pressed={barberId === ANY_BARBER}
                    onClick={() => setBarberId(ANY_BARBER)}
                    className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 p-3 text-start transition-colors duration-150 disabled:cursor-not-allowed ${
                      barberId === ANY_BARBER ? "border-accent bg-accent-soft" : "border-border bg-surface hover:border-border-strong"
                    }`}
                  >
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                      <UsersIcon className="h-6 w-6" />
                    </span>
                    <span className="flex min-w-0 flex-1 flex-col">
                      <span className="text-base font-bold text-fg">{t.anyBarber}</span>
                      <span className="text-sm text-muted">{t.anyBarberHint}</span>
                    </span>
                    {barberId === ANY_BARBER ? <CheckIcon className="h-5 w-5 shrink-0 text-accent" /> : null}
                  </button>
                </li>
                {barberOptions.map(({ barber, status }) => {
                  const isBookable = status === "available";
                  const isSelected = barberId === barber.id;
                  return (
                    <li key={barber.id}>
                      <button
                        type="button"
                        disabled={!isBookable}
                        aria-pressed={isSelected}
                        onClick={() => setBarberId(barber.id)}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg border-2 p-3 text-start transition-colors duration-150 disabled:cursor-not-allowed ${
                          !isBookable
                            ? "border-transparent bg-surface-2"
                            : isSelected
                              ? "border-accent bg-accent-soft"
                              : "border-border bg-surface hover:border-border-strong"
                        }`}
                      >
                        <span className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-surface-2">
                          {barber.imageUrl ? (
                            <Image
                              src={barber.imageUrl}
                              alt=""
                              fill
                              sizes="48px"
                              className={`object-cover ${isBookable ? "" : "opacity-60 grayscale"}`}
                            />
                          ) : null}
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className={`text-base font-bold ${isBookable ? "text-fg" : "text-disabled-fg"}`}>
                            {translateBarberName(barber.name)}
                          </span>
                          <span className="text-sm text-muted">{translateBarberRole(barber.role)}</span>
                        </span>
                        <StatusBadge status={status} label={t.statusLabels[status]} />
                      </button>
                    </li>
                  );
                })}
              </ul>
            ) : null}

            {step === 4 ? (
              <form
                id="booking-details"
                noValidate
                onSubmit={(event) => {
                  event.preventDefault();
                  submitBooking();
                }}
                className="grid gap-4 sm:grid-cols-2"
              >
                <FormField
                  id="booking-fullName"
                  label={t.fullNameLabel}
                  autoComplete="name"
                  enterKeyHint="next"
                  required
                  value={details.fullName}
                  error={fieldErrors.fullName}
                  onChange={(event) => updateDetail("fullName", event.target.value)}
                  onBlur={() => blurDetail("fullName")}
                  className="sm:col-span-2"
                />
                <FormField
                  id="booking-phone"
                  label={t.phoneLabel}
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  dir="ltr"
                  enterKeyHint="next"
                  placeholder={t.phonePlaceholder}
                  required
                  value={details.phone}
                  error={fieldErrors.phone}
                  onChange={(event) => updateDetail("phone", event.target.value)}
                  onBlur={() => blurDetail("phone")}
                />
                <FormField
                  id="booking-email"
                  label={t.emailLabel}
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  autoCapitalize="none"
                  spellCheck={false}
                  dir="ltr"
                  enterKeyHint="next"
                  required
                  value={details.email}
                  error={fieldErrors.email}
                  onChange={(event) => updateDetail("email", event.target.value)}
                  onBlur={() => blurDetail("email")}
                />
                <FormField
                  id="booking-notes"
                  multiline
                  rows={3}
                  label={t.notesLabel}
                  value={details.notes}
                  error={fieldErrors.notes}
                  onChange={(event) => updateDetail("notes", event.target.value)}
                  onBlur={() => blurDetail("notes")}
                  className="sm:col-span-2"
                />
                {!isBookingConfigured ? (
                  <p className="rounded-lg border border-accent bg-accent-soft px-4 py-3 text-sm text-fg sm:col-span-2">
                    {isDev ? NOT_CONFIGURED_MESSAGE_DEV : t.notConfiguredProd}
                  </p>
                ) : null}
              </form>
            ) : null}

            {submitError && step === 4 ? (
              <p role="alert" className="mt-4 flex items-start gap-2 rounded-lg bg-error-soft p-3 text-sm font-semibold text-error">
                <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
                {submitError}
              </p>
            ) : null}
          </div>

          {/* Step bar: sticks to the bottom of the screen on phones while the booking flow is in view; static on desktop. */}
          <div className="sticky bottom-0 z-30 flex items-center gap-3 rounded-b-lg border-t border-border bg-canvas/95 px-4 pt-3 pb-[calc(12px+env(safe-area-inset-bottom))] shadow-raised backdrop-blur-md sm:px-6 lg:static lg:pb-3 lg:shadow-none">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => goToStep((step - 1) as Step)}
                disabled={isSubmitting}
                aria-label={t.back}
                className="inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-surface text-fg hover:bg-surface-2 disabled:opacity-45"
              >
                <BackIcon />
              </button>
            ) : null}
            <div className="flex min-w-0 flex-1 flex-col">
              {selectedService ? (
                <>
                  {/* Service name and price wrap rather than truncate, so the price is always visible. */}
                  <span className="flex min-w-0 flex-wrap items-baseline gap-x-1.5 text-base leading-snug font-bold text-fg">
                    <span>{translateServiceName(selectedService.name)}</span>
                    <span className="shrink-0 tabular-nums">
                      · <Bidi>{formatPrice(selectedService.priceIls, locale)}</Bidi>
                    </span>
                  </span>
                  {whenParts.length ? <span className="line-clamp-2 text-sm leading-snug text-muted">{whenParts.join(" · ")}</span> : null}
                </>
              ) : (
                <span className="text-sm text-muted">{t.summaryPrompt}</span>
              )}
            </div>
            {/* Distinct keys: if React reused one <button> for both, the tap on "Continue" would turn it
                into the submit button mid-click and submit the empty details form. */}
            {step < 4 ? (
              <Button key="next" onClick={() => goToStep((step + 1) as Step)} disabled={!canContinue} className="shrink-0 px-5">
                {t.continue}
                <ForwardIcon className="hidden h-4 w-4 sm:block" />
              </Button>
            ) : (
              <Button
                key="submit"
                type="submit"
                form="booking-details"
                disabled={isSubmitting || !isBookingConfigured}
                loading={isSubmitting}
                className="shrink-0 px-5"
              >
                {isSubmitting ? t.confirming : t.confirmBooking}
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

// -----------------------------------------------------------------------------
// Confirmation screen.
// -----------------------------------------------------------------------------

function BookingConfirmation({
  confirmation,
  headingRef,
  onStartOver,
}: {
  confirmation: BookingSummary;
  headingRef: React.RefObject<HTMLHeadingElement | null>;
  onStartOver: () => void;
}) {
  const { locale, dict } = useLocale();
  const t = dict.booking;
  const [copied, setCopied] = useState(false);

  const serviceName = dict.services.nameByEnglish[confirmation.service.name] ?? confirmation.service.name;
  const barberName = dict.barbers.nameByEnglish[confirmation.barber.name] ?? confirmation.barber.name;
  const calendarHref = `/calendar?${new URLSearchParams({
    date: confirmation.date,
    start: confirmation.startTime,
    end: confirmation.endTime,
    ref: confirmation.bookingReference,
    service: confirmation.service.name,
    barber: confirmation.barber.name,
    lang: locale,
  })}`;
  const manageHref = `/manage-booking?${new URLSearchParams({ ref: confirmation.bookingReference })}`;

  async function copyReference() {
    try {
      await navigator.clipboard.writeText(confirmation.bookingReference);
    } catch {
      // Older browsers / insecure contexts: fall back to a temporary text field.
      const field = document.createElement("textarea");
      field.value = confirmation.bookingReference;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.opacity = "0";
      document.body.appendChild(field);
      field.select();
      document.execCommand("copy");
      field.remove();
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2500);
  }

  const rows: [string, React.ReactNode][] = [
    [t.serviceLabel, serviceName],
    [t.barberLabel, barberName],
    [t.dateLabel, formatDate(confirmation.date, locale)],
    [t.timeLabel, <Bidi key="time">{`${confirmation.startTime}–${confirmation.endTime}`}</Bidi>],
    [t.priceLabel, <Bidi key="price">{formatPrice(confirmation.service.priceIls, locale)}</Bidi>],
  ];

  return (
    <div className="flex flex-col items-center gap-5 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success-soft text-success">
        <CheckIcon className="h-8 w-8" />
      </span>
      <div role="status" className="flex flex-col gap-2">
        <h2 ref={headingRef} tabIndex={-1} className="font-display text-[48px] leading-[0.95] font-bold text-fg outline-none">
          {t.confirmedHeading}
        </h2>
        <p className="text-base text-muted">{format(t.confirmedBody, { name: confirmation.customerName })}</p>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-lg border border-border bg-canvas p-4 text-start sm:p-6">
        <div className="flex flex-col items-center gap-3 rounded-md bg-accent-soft p-4">
          <span className="text-sm font-semibold text-accent">{t.referenceLabel}</span>
          <span dir="ltr" className="text-3xl font-bold tracking-wider text-fg tabular-nums sm:text-4xl">
            {confirmation.bookingReference}
          </span>
          <Button variant="secondary" onClick={copyReference} aria-label={t.copyAria} className="min-w-32">
            {copied ? <CheckIcon className="h-4 w-4 text-success" /> : <CopyIcon className="h-4 w-4" />}
            <span aria-live="polite">{copied ? t.copied : t.copy}</span>
          </Button>
        </div>

        <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-base">
          {rows.map(([label, value]) => (
            <div key={label} className="flex flex-col">
              <dt className="text-sm text-muted">{label}</dt>
              <dd className="font-semibold text-fg">{value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="grid w-full gap-3 sm:grid-cols-2">
        <Button href={calendarHref} variant="primary">
          <CalendarIcon className="h-5 w-5" />
          {t.addToCalendar}
        </Button>
        <Button href={manageHref} variant="secondary">
          {t.goToManage}
        </Button>
      </div>

      <p className="w-full rounded-lg bg-canvas p-3 text-sm text-muted">{t.demoEmailNotice}</p>

      <Button variant="ghost" onClick={onStartOver}>
        {t.bookAnother}
      </Button>
    </div>
  );
}

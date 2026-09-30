import { Resend } from "resend";
import { formatDateLong, formatInstant, formatPrice } from "@/lib/format";
import {
  getEmailStrings,
  OWNER_EMAIL_LOCALE,
  translateBarberNameForLocale,
  translateServiceNameForLocale,
} from "@/i18n/email";
import { defaultLocale, dirForLocale, type Locale } from "@/i18n/config";
import { format } from "@/i18n";

export interface EmailDeliveryResult {
  delivered: boolean;
  /** True when the failure is specifically Resend's sandbox restriction —
   * i.e. sending to any address other than the account owner's is blocked
   * until a domain is verified. Lets callers give a precise explanation
   * instead of a generic failure message. */
  sandboxRestricted?: boolean;
  error?: string;
}

export interface BookingEmailInput {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  serviceName: string;
  servicePriceIls: number;
  barberName: string;
  date: string;
  startTime: string;
  endTime: string;
  customerNotes?: string | null;
  /** Customer's selected UI locale, used for the customer-facing emails only (owner emails are always Hebrew). */
  locale?: Locale;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/** Wraps LTR values (times, references, emails, phones) so they keep their order inside RTL text. */
function ltr(value: string): string {
  return `<bdi dir="ltr">${escapeHtml(value)}</bdi>`;
}

type Row = [label: string, valueHtml: string];

function renderEmailHtml(locale: Locale, title: string, rows: Row[], bodyHtml?: string): string {
  const strings = getEmailStrings(locale);
  const dir = dirForLocale(locale);
  const align = dir === "rtl" ? "right" : "left";

  const rowsHtml = rows
    .map(
      ([label, valueHtml]) =>
        `<tr><td style="padding:8px 0; color:#57534e; width:38%; vertical-align:top;">${escapeHtml(label)}</td><td style="padding:8px 0; color:#1c1917;">${valueHtml}</td></tr>`,
    )
    .join("");

  return `
    <div dir="${dir}" lang="${locale}" style="background:#faf7f2; padding:24px 12px; font-family: Arial, Helvetica, sans-serif; text-align:${align};">
      <div style="max-width:560px; margin:0 auto; background:#ffffff; border:1px solid #e4ddd2; border-radius:12px; padding:24px;">
        <p style="margin:0 0 4px; color:#8a5a0b; font-size:13px; font-weight:bold;">MOATSEM</p>
        <h1 style="margin:0 0 16px; color:#1c1917; font-size:22px; line-height:1.3;">${escapeHtml(title)}</h1>
        <table style="width:100%; border-collapse:collapse; font-size:15px; line-height:1.5;"><tbody>${rowsHtml}</tbody></table>
        ${bodyHtml ?? ""}
      </div>
      <p style="max-width:560px; margin:12px auto 0; color:#57534e; font-size:12px;">${escapeHtml(strings.footer)}</p>
    </div>
  `.trim();
}

function isSandboxRestrictionError(
  error: { statusCode?: number | null; message?: string | null } | null | undefined,
): boolean {
  return error?.statusCode === 403 && /own email address/i.test(error?.message ?? "");
}

/**
 * Low-level send, shared by every email in this module. Server-only: relies
 * on RESEND_API_KEY, which is never exposed to the browser. Never throws —
 * returns a result object so callers can lose an email without losing the
 * database write that already happened.
 */
async function sendEmail(params: { to: string; subject: string; html: string; replyTo?: string }): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.RESEND_FROM_EMAIL;

  if (!apiKey || !fromEmail) {
    const missing = [!apiKey && "RESEND_API_KEY", !fromEmail && "RESEND_FROM_EMAIL"].filter(Boolean);
    console.error("sendEmail: Resend is not configured. Missing:", missing.join(", "));
    return { delivered: false, error: "not_configured" };
  }

  const resend = new Resend(apiKey);

  try {
    const { error } = await resend.emails.send({
      from: `MOATSEM <${fromEmail}>`,
      to: params.to,
      replyTo: params.replyTo,
      subject: params.subject,
      html: params.html,
    });

    if (error) {
      if (isSandboxRestrictionError(error)) {
        console.error(
          `sendEmail: Resend sandbox restriction — cannot send to ${params.to} until a domain is verified at resend.com/domains.`,
        );
        return { delivered: false, sandboxRestricted: true, error: "sandbox_restricted" };
      }
      console.error("sendEmail: Resend returned an error:", error.message);
      return { delivered: false, error: error.message };
    }
    return { delivered: true };
  } catch (error) {
    console.error("sendEmail: send threw:", error);
    return { delivered: false, error: "send_failed" };
  }
}

function requireReceiverEmail(): string | null {
  const toEmail = process.env.CONTACT_RECEIVER_EMAIL;
  if (!toEmail) {
    console.error("Resend: CONTACT_RECEIVER_EMAIL is not configured.");
    return null;
  }
  return toEmail;
}

// ---------------------------------------------------------------------------
// Contact form (owner only)
// ---------------------------------------------------------------------------

interface ContactNotificationInput {
  fullName: string;
  email: string;
  phone: string | null;
  subject: string | null;
  message: string;
  submittedAt: Date;
}

export async function sendContactNotificationEmail(input: ContactNotificationInput): Promise<EmailDeliveryResult> {
  const toEmail = requireReceiverEmail();
  if (!toEmail) return { delivered: false, error: "not_configured" };

  const locale = OWNER_EMAIL_LOCALE;
  const strings = getEmailStrings(locale);
  const subject = input.subject?.trim() || strings.owner.contactDefaultSubject;

  const html = renderEmailHtml(
    locale,
    strings.owner.contactTitle,
    [
      [strings.contactLabels.name, escapeHtml(input.fullName)],
      [strings.contactLabels.email, ltr(input.email)],
      [strings.contactLabels.phone, input.phone ? ltr(input.phone) : strings.empty],
      [strings.contactLabels.subject, input.subject ? escapeHtml(input.subject) : strings.empty],
      [
        strings.contactLabels.submitted,
        `${escapeHtml(formatInstant(input.submittedAt, locale))} ${escapeHtml(strings.israelTime)}`,
      ],
    ],
    `<p style="color:#57534e; margin:16px 0 4px;">${escapeHtml(strings.contactLabels.message)}</p>
     <p style="white-space:pre-wrap; margin:0; border-inline-start:3px solid #8a5a0b; padding-inline-start:12px; color:#1c1917;">${escapeHtml(input.message)}</p>`,
  );

  return sendEmail({
    to: toEmail,
    replyTo: input.email,
    subject: format(strings.owner.contactSubject, { subject }),
    html,
  });
}

// ---------------------------------------------------------------------------
// Booking emails
// ---------------------------------------------------------------------------

function bookingRows(input: BookingEmailInput, locale: Locale, extra: Row[] = []): Row[] {
  const { labels } = getEmailStrings(locale);
  return [
    [labels.bookingReference, `<strong>${ltr(input.bookingReference)}</strong>`],
    [labels.service, escapeHtml(translateServiceNameForLocale(input.serviceName, locale))],
    [labels.barber, escapeHtml(translateBarberNameForLocale(input.barberName, locale))],
    [labels.date, escapeHtml(formatDateLong(input.date, locale))],
    [labels.time, ltr(`${input.startTime}–${input.endTime}`)],
    [labels.price, ltr(formatPrice(input.servicePriceIls, locale))],
    [labels.customer, escapeHtml(input.customerName)],
    [labels.email, ltr(input.customerEmail)],
    [labels.phone, ltr(input.customerPhone)],
    ...extra,
  ];
}

function subjectValues(input: BookingEmailInput, locale: Locale) {
  return { name: input.customerName, date: formatDateLong(input.date, locale), time: input.startTime };
}

export async function sendBookingOwnerNotificationEmail(input: BookingEmailInput): Promise<EmailDeliveryResult> {
  const toEmail = requireReceiverEmail();
  if (!toEmail) return { delivered: false, error: "not_configured" };

  const locale = OWNER_EMAIL_LOCALE;
  const strings = getEmailStrings(locale);
  const notesRow: Row[] = input.customerNotes ? [[strings.labels.notes, escapeHtml(input.customerNotes)]] : [];

  return sendEmail({
    to: toEmail,
    replyTo: input.customerEmail,
    subject: format(strings.owner.newBookingSubject, subjectValues(input, locale)),
    html: renderEmailHtml(locale, strings.owner.newBookingTitle, bookingRows(input, locale, notesRow)),
  });
}

export async function sendBookingCustomerConfirmationEmail(input: BookingEmailInput): Promise<EmailDeliveryResult> {
  const locale = input.locale ?? defaultLocale;
  const strings = getEmailStrings(locale);

  return sendEmail({
    to: input.customerEmail,
    subject: format(strings.customer.confirmedSubject, subjectValues(input, locale)),
    html: renderEmailHtml(
      locale,
      strings.customer.confirmedTitle,
      bookingRows(input, locale),
      `<p style="color:#57534e; margin:16px 0 0;">${escapeHtml(strings.customer.confirmedNote)}</p>`,
    ),
  });
}

export async function sendCancellationOwnerNotificationEmail(
  input: BookingEmailInput & { cancelledAt: Date },
): Promise<EmailDeliveryResult> {
  const toEmail = requireReceiverEmail();
  if (!toEmail) return { delivered: false, error: "not_configured" };

  const locale = OWNER_EMAIL_LOCALE;
  const strings = getEmailStrings(locale);
  const cancelledAtRow: Row = [
    strings.labels.cancelledAt,
    `${escapeHtml(formatInstant(input.cancelledAt, locale))} ${escapeHtml(strings.israelTime)}`,
  ];

  return sendEmail({
    to: toEmail,
    replyTo: input.customerEmail,
    subject: format(strings.owner.cancelledSubject, subjectValues(input, locale)),
    html: renderEmailHtml(locale, strings.owner.cancelledTitle, bookingRows(input, locale, [cancelledAtRow])),
  });
}

export async function sendCancellationCustomerEmail(
  input: BookingEmailInput & { cancelledAt: Date },
): Promise<EmailDeliveryResult> {
  const locale = input.locale ?? defaultLocale;
  const strings = getEmailStrings(locale);
  const cancelledAtRow: Row = [
    strings.labels.cancelledAt,
    `${escapeHtml(formatInstant(input.cancelledAt, locale))} ${escapeHtml(strings.israelTime)}`,
  ];

  return sendEmail({
    to: input.customerEmail,
    subject: format(strings.customer.cancelledSubject, subjectValues(input, locale)),
    html: renderEmailHtml(
      locale,
      strings.customer.cancelledTitle,
      bookingRows(input, locale, [cancelledAtRow]),
      `<p style="color:#57534e; margin:16px 0 0;">${escapeHtml(strings.customer.cancelledNote)}</p>`,
    ),
  });
}

import { Resend } from "resend";
import { formatPrice } from "@/lib/format";
import { getEmailStrings, translateServiceNameForLocale } from "@/i18n/email";
import { defaultLocale, type Locale } from "@/i18n/config";

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
  /** Customer's selected UI locale, used for the customer-facing emails only (owner emails stay English). */
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

function renderEmailHtml(
  title: string,
  rows: [string, string][],
  bodyHtml?: string,
  direction: "ltr" | "rtl" = "ltr",
): string {
  const rowsHtml = rows
    .map(
      ([label, value]) =>
        `<tr><td style="padding:6px 0; color:#666;">${escapeHtml(label)}</td><td style="padding:6px 0;">${escapeHtml(value)}</td></tr>`,
    )
    .join("");

  const alignStyle = direction === "rtl" ? "text-align:right;" : "";

  return `
    <div dir="${direction}" style="font-family: sans-serif; max-width: 560px; margin: 0 auto; ${alignStyle}">
      <h2 style="color:#111;">${escapeHtml(title)}</h2>
      <table style="width:100%; border-collapse: collapse;"><tbody>${rowsHtml}</tbody></table>
      ${bodyHtml ?? ""}
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
// Contact form
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

  const submittedAtLabel = input.submittedAt.toLocaleString("en-US", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "full",
    timeStyle: "short",
  });

  const html = renderEmailHtml(
    "New contact message — MOATSEM",
    [
      ["Name", input.fullName],
      ["Email", input.email],
      ["Phone", input.phone ?? "—"],
      ["Subject", input.subject ?? "—"],
      ["Submitted", `${submittedAtLabel} (Asia/Jerusalem)`],
    ],
    `<p style="color:#666; margin-top:16px;">Message</p>
     <p style="white-space: pre-wrap; border-left: 3px solid #c9a24b; padding-left: 12px;">${escapeHtml(input.message)}</p>`,
  );

  return sendEmail({
    to: toEmail,
    replyTo: input.email,
    subject: `New contact message: ${input.subject?.trim() || "Website inquiry"}`,
    html,
  });
}

// ---------------------------------------------------------------------------
// Booking created
// ---------------------------------------------------------------------------

function bookingRows(
  input: BookingEmailInput,
  labels: ReturnType<typeof getEmailStrings>["labels"],
  serviceName: string,
  extra?: [string, string][],
): [string, string][] {
  return [
    [labels.bookingReference, input.bookingReference],
    [labels.customer, input.customerName],
    [labels.email, input.customerEmail],
    [labels.phone, input.customerPhone],
    [labels.service, `${serviceName} (${formatPrice(input.servicePriceIls)})`],
    [labels.barber, input.barberName],
    [labels.date, input.date],
    [labels.time, `${input.startTime}–${input.endTime}`],
    ...(extra ?? []),
  ];
}

export async function sendBookingOwnerNotificationEmail(input: BookingEmailInput): Promise<EmailDeliveryResult> {
  const toEmail = requireReceiverEmail();
  if (!toEmail) return { delivered: false, error: "not_configured" };

  const labels = getEmailStrings(defaultLocale).labels;
  const html = renderEmailHtml("New booking — MOATSEM", bookingRows(input, labels, input.serviceName));

  return sendEmail({
    to: toEmail,
    replyTo: input.customerEmail,
    subject: `New booking: ${input.customerName} — ${input.date} ${input.startTime}`,
    html,
  });
}

export async function sendBookingCustomerConfirmationEmail(input: BookingEmailInput): Promise<EmailDeliveryResult> {
  const locale = input.locale ?? defaultLocale;
  const strings = getEmailStrings(locale);
  const serviceName = translateServiceNameForLocale(input.serviceName, locale);

  const html = renderEmailHtml(
    strings.confirmedTitle,
    bookingRows(input, strings.labels, serviceName),
    `<p style="color:#666; margin-top:16px;">${escapeHtml(strings.confirmedNote)}</p>`,
    strings.dir,
  );

  return sendEmail({
    to: input.customerEmail,
    subject: strings.confirmedSubject(input.date, input.startTime),
    html,
  });
}

// ---------------------------------------------------------------------------
// Booking cancelled
// ---------------------------------------------------------------------------

export async function sendCancellationOwnerNotificationEmail(
  input: BookingEmailInput & { cancelledAt: Date },
): Promise<EmailDeliveryResult> {
  const toEmail = requireReceiverEmail();
  if (!toEmail) return { delivered: false, error: "not_configured" };

  const labels = getEmailStrings(defaultLocale).labels;
  const cancelledAtLabel = input.cancelledAt.toLocaleString("en-US", {
    timeZone: "Asia/Jerusalem",
    dateStyle: "full",
    timeStyle: "short",
  });

  const html = renderEmailHtml(
    "Booking cancelled — MOATSEM",
    bookingRows(input, labels, input.serviceName, [[labels.cancelledAt, `${cancelledAtLabel} (Asia/Jerusalem)`]]),
  );

  return sendEmail({
    to: toEmail,
    replyTo: input.customerEmail,
    subject: `Booking cancelled: ${input.customerName} — ${input.date} ${input.startTime}`,
    html,
  });
}

export async function sendCancellationCustomerEmail(
  input: BookingEmailInput & { cancelledAt: Date },
): Promise<EmailDeliveryResult> {
  const locale = input.locale ?? defaultLocale;
  const strings = getEmailStrings(locale);
  const serviceName = translateServiceNameForLocale(input.serviceName, locale);
  const cancelledAtLocale = locale === "he" ? "he-IL" : "en-US";
  const cancelledAtLabel = input.cancelledAt.toLocaleString(cancelledAtLocale, {
    timeZone: "Asia/Jerusalem",
    dateStyle: "full",
    timeStyle: "short",
  });

  const html = renderEmailHtml(
    strings.cancelledTitle,
    bookingRows(input, strings.labels, serviceName, [[strings.labels.cancelledAt, `${cancelledAtLabel} (Asia/Jerusalem)`]]),
    `<p style="color:#666; margin-top:16px;">${escapeHtml(strings.cancelledNote)}</p>`,
    strings.dir,
  );

  return sendEmail({
    to: input.customerEmail,
    subject: strings.cancelledSubject(input.date, input.startTime),
    html,
  });
}

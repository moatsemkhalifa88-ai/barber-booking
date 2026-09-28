"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { sendContactNotificationEmail } from "@/lib/email/resend";
import { getMissingEnvVars, isDevelopment, isSupabaseConfigured, SUPABASE_ENV_VARS } from "@/lib/env";
import { isNonEmptyString, isValidEmail, isValidPhone } from "@/lib/validation";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary, type Dictionary } from "@/i18n";

export interface ContactFormInput {
  fullName: string;
  email: string;
  phone?: string;
  subject?: string;
  message: string;
}

/**
 * Every outcome the contact form can land in, kept distinct rather than
 * collapsed into one generic error — see ContactForm.tsx for how each is
 * displayed.
 */
export type ContactActionResult =
  | { success: true; status: "sent" }
  | { success: true; status: "sent_email_failed" }
  | { success: false; reason: "validation" | "not_configured" | "database_error" | "unknown"; error: string };

function validate(input: ContactFormInput, dict: Dictionary): string | null {
  const { errors } = dict.contact;
  if (!isNonEmptyString(input.fullName, 200)) return errors.fullName;
  if (!isValidEmail(input.email)) return errors.email;
  if (input.phone && !isValidPhone(input.phone)) return errors.phone;
  if (input.subject && !isNonEmptyString(input.subject, 200)) return errors.subject;
  if (!isNonEmptyString(input.message, 5000)) return errors.message;
  return null;
}

function notConfiguredResult(dict: Dictionary): ContactActionResult {
  const missing = getMissingEnvVars(SUPABASE_ENV_VARS);
  // Log the exact missing variable *names* server-side only — never a value,
  // and never sent to the client in production.
  console.error("Contact form is not configured. Missing environment variables:", missing.join(", "));

  return {
    success: false,
    reason: "not_configured",
    error: isDevelopment
      ? `Development notice: contact storage is not configured. Missing: ${missing.join(", ")}. Set them in .env.local.`
      : dict.contact.errors.notConfiguredProd,
  };
}

export async function submitContactMessageAction(input: ContactFormInput): Promise<ContactActionResult> {
  const dict = getDictionary(await getLocale());

  const validationError = validate(input, dict);
  if (validationError) {
    return { success: false, reason: "validation", error: validationError };
  }

  if (!isSupabaseConfigured()) {
    return notConfiguredResult(dict);
  }

  const supabase = createAdminClient();
  const submittedAt = new Date();

  const { error: insertError } = await supabase.from("contact_messages").insert({
    full_name: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    subject: input.subject?.trim() || null,
    message: input.message.trim(),
  });

  if (insertError) {
    console.error("submitContactMessageAction: database insert failed:", insertError.message);
    return {
      success: false,
      reason: "database_error",
      error: dict.contact.errors.databaseError,
    };
  }

  // The message is safely stored regardless of what happens next. Email
  // delivery failure is reported back to the caller as a distinct, non-fatal
  // status — the shop owner can still see the message in Supabase, and the
  // customer is told their submission succeeded (it did).
  const { delivered } = await sendContactNotificationEmail({
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    phone: input.phone?.trim() || null,
    subject: input.subject?.trim() || null,
    message: input.message.trim(),
    submittedAt,
  });

  return { success: true, status: delivered ? "sent" : "sent_email_failed" };
}

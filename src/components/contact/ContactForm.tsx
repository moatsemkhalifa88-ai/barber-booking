"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import { FormField } from "@/components/ui/FormField";
import { AlertIcon } from "@/components/ui/Icons";
import { submitContactMessageAction } from "@/lib/contact/actions";
import { useLocale } from "@/i18n/LocaleProvider";
import { format } from "@/i18n";

export function ContactForm() {
  const { dict } = useLocale();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const [isSubmitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<"sent" | "sent_email_failed" | null>(null);

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (isSubmitting || result) return; // guards against accidental duplicate submissions
    setError(null);

    startTransition(() => {
      submitContactMessageAction({
        fullName,
        email,
        phone: phone || undefined,
        subject: subject || undefined,
        message,
      }).then((response) => {
        if (response.success) {
          setResult(response.status);
        } else {
          setError(response.error);
        }
      });
    });
  }

  if (result) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-canvas p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="font-display text-[34px] leading-[0.95] font-bold text-fg" role="status">
          {dict.contact.receivedTitle}
        </p>
        <p className="max-w-sm text-sm text-muted">
          {format(dict.contact.receivedBody, { name: fullName.trim().split(/\s+/)[0] })}
          {result === "sent_email_failed" ? dict.contact.emailDelayedNote : ""}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-lg border border-border bg-canvas p-4 sm:p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField
          label={dict.contact.fullName}
          required
          autoComplete="name"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
        <FormField
          label={dict.contact.email}
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
        <FormField
          label={dict.contact.phoneOptional}
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          dir="ltr"
          placeholder={dict.contact.phonePlaceholder}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <FormField label={dict.contact.subject} value={subject} onChange={(event) => setSubject(event.target.value)} />
      </div>

      <FormField
        multiline
        label={dict.contact.message}
        required
        rows={4}
        value={message}
        onChange={(event) => setMessage(event.target.value)}
      />

      {error ? (
        <p role="alert" className="flex items-start gap-2 rounded-lg bg-error-soft p-3 text-sm font-semibold text-error">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : null}

      <Button type="submit" variant="primary" disabled={isSubmitting} loading={isSubmitting} className="w-full sm:w-auto sm:self-start">
        {isSubmitting ? dict.contact.sending : dict.contact.send}
      </Button>
    </form>
  );
}

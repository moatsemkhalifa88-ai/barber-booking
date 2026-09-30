"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
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
      <div className="flex flex-col items-center gap-3 rounded-2xl border border-accent bg-surface-2 p-8 text-center">
        <span className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-success-soft text-success">
          <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden="true">
            <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="font-display text-xl font-bold text-fg" role="status">
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 rounded-2xl border border-border bg-surface-2 p-6 sm:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-muted">
          {dict.contact.fullName}
          <input
            required
            value={fullName}
            onChange={(event) => setFullName(event.target.value)}
            className="field"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-muted">
          {dict.contact.email}
          <input
            required
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="field"
          />
        </label>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-2 text-sm text-muted">
          {dict.contact.phoneOptional}
          <input
            type="tel"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="field"
          />
        </label>
        <label className="flex flex-col gap-2 text-sm text-muted">
          {dict.contact.subject}
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="field"
          />
        </label>
      </div>

      <label className="flex flex-col gap-2 text-sm text-muted">
        {dict.contact.message}
        <textarea
          required
          rows={4}
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          className="resize-none field"
        />
      </label>

      {error ? <p className="text-sm text-error">{error}</p> : null}

      <Button type="submit" variant="primary" disabled={isSubmitting} className="self-start">
        {isSubmitting ? dict.contact.sending : dict.contact.send}
      </Button>
    </form>
  );
}

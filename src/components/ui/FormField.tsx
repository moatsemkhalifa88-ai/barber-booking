"use client";

import { useId, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { AlertIcon } from "@/components/ui/Icons";

type SharedProps = {
  label: string;
  /** Shown under the field with an icon; also sets aria-invalid. */
  error?: string | null;
  /** Persistent hint under the field (hidden while an error is shown). */
  helper?: string;
  className?: string;
};

type InputProps = SharedProps & InputHTMLAttributes<HTMLInputElement> & { multiline?: false };
type TextareaProps = SharedProps & TextareaHTMLAttributes<HTMLTextAreaElement> & { multiline: true };

/** Label above, 48px field, helper or error below — see "Form fields" in DESIGN_SYSTEM.md. */
export function FormField(props: InputProps | TextareaProps) {
  const generatedId = useId();
  const { label, error, helper, className = "", id = generatedId, multiline, ...rest } = props;
  const messageId = `${id}-message`;
  const describedBy = error || helper ? messageId : undefined;
  const common = {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy,
  } as const;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label htmlFor={id} className="text-sm font-semibold text-fg">
        {label}
      </label>
      {multiline ? (
        <textarea
          {...common}
          {...(rest as TextareaHTMLAttributes<HTMLTextAreaElement>)}
          className="field resize-none"
        />
      ) : (
        <input {...common} {...(rest as InputHTMLAttributes<HTMLInputElement>)} className="field" />
      )}
      {error ? (
        <p id={messageId} className="flex items-start gap-1.5 text-sm font-semibold text-error">
          <AlertIcon className="mt-0.5 h-4 w-4 shrink-0" />
          {error}
        </p>
      ) : helper ? (
        <p id={messageId} className="text-sm text-muted">
          {helper}
        </p>
      ) : null}
    </div>
  );
}

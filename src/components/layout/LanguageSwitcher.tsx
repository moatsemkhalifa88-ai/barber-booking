"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, dict, setLocale } = useLocale();

  const options: { value: Locale; label: string }[] = [
    { value: "en", label: dict.nav.english },
    { value: "he", label: dict.nav.hebrew },
  ];

  return (
    <div
      role="group"
      aria-label={dict.nav.languageLabel}
      className={`inline-flex items-center gap-1 rounded-full border border-line p-1 ${className}`}
    >
      {options.map((option) => {
        const isActive = option.value === locale;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isActive}
            onClick={() => setLocale(option.value)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold tracking-wide transition-colors duration-200 ${
              isActive ? "bg-gold text-ink" : "text-muted hover:text-gold-light"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

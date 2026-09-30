"use client";

import { useLocale } from "@/i18n/LocaleProvider";
import type { Locale } from "@/i18n/config";

// Each option is named in its own language, so it is recognisable whatever the current UI language is.
const options: { value: Locale; accessibleName: string }[] = [
  { value: "he", accessibleName: "עברית" },
  { value: "en", accessibleName: "English" },
];

export function LanguageSwitcher({ className = "" }: { className?: string }) {
  const { locale, dict, setLocale } = useLocale();
  const shortLabel: Record<Locale, string> = { he: dict.nav.hebrew, en: dict.nav.english };

  return (
    <div
      role="group"
      aria-label={dict.nav.languageLabel}
      className={`inline-flex items-center rounded-md border border-border-strong bg-surface p-0.5 ${className}`}
    >
      {options.map((option) => {
        const isActive = option.value === locale;
        return (
          <button
            key={option.value}
            type="button"
            lang={option.value}
            aria-label={option.accessibleName}
            aria-pressed={isActive}
            onClick={() => setLocale(option.value)}
            className={`min-h-10 min-w-10 cursor-pointer rounded-[7px] px-2.5 text-sm font-bold transition-colors duration-150 ${
              isActive ? "bg-primary text-on-primary" : "text-fg hover:bg-surface-2"
            }`}
          >
            {shortLabel[option.value]}
          </button>
        );
      })}
    </div>
  );
}

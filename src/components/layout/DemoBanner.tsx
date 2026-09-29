"use client";

import { useState } from "react";
import { useLocale } from "@/i18n/LocaleProvider";
import { DEMO_BANNER_COOKIE, DEMO_BANNER_COOKIE_MAX_AGE } from "@/lib/demo";

export function DemoBanner() {
  const [isVisible, setIsVisible] = useState(true);
  const { dict } = useLocale();

  if (!isVisible) return null;

  function dismiss() {
    setIsVisible(false);
    document.cookie = `${DEMO_BANNER_COOKIE}=1; path=/; max-age=${DEMO_BANNER_COOKIE_MAX_AGE}; samesite=lax`;
  }

  return (
    <div role="region" aria-label={dict.demoBanner.message} className="border-b border-gold/30 bg-gold/10">
      <div className="mx-auto flex max-w-7xl items-center gap-3 px-6 py-2 sm:px-8 lg:px-12">
        <p className="flex-1 text-center text-xs text-gold-light">{dict.demoBanner.message}</p>
        <button
          type="button"
          onClick={dismiss}
          aria-label={dict.demoBanner.dismiss}
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-gold-light transition-colors duration-200 hover:bg-gold/20"
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

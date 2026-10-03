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
    <div role="region" aria-label={dict.demoBanner.message} className="bg-brand">
      <div className="container-page flex h-10 items-center gap-2">
        <p className="min-w-0 flex-1 truncate text-center text-[13px] font-semibold text-on-brand sm:text-sm">
          <span className="sm:hidden">{dict.demoBanner.messageShort}</span>
          <span className="hidden sm:inline">{dict.demoBanner.message}</span>
        </p>
        <button
          type="button"
          onClick={dismiss}
          aria-label={dict.demoBanner.dismiss}
          className="-me-2 inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-md text-on-brand transition-colors duration-150 hover:bg-ink/10"
        >
          <svg width="12" height="12" viewBox="0 0 10 10" fill="none" aria-hidden="true">
            <line x1="1" y1="1" x2="9" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <line x1="9" y1="1" x2="1" y2="9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}

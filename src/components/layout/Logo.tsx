"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/LocaleProvider";

/**
 * Header wordmark: a minimal gold scissors emblem in a ringed badge next to
 * the MOATSEM wordmark. Pure SVG/CSS, no image asset — sized to match the
 * mobile menu toggle button so the header's overall height is unchanged.
 */
export function Logo() {
  const { dict } = useLocale();

  return (
    <Link href="/#home" aria-label={dict.logo.ariaLabel} className="group flex items-center gap-3">
      <span
        aria-hidden="true"
        className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gold/50 transition-all duration-300 group-hover:border-gold group-hover:shadow-[0_0_16px_-2px_rgba(201,162,75,0.5)]"
      >
        <svg
          viewBox="0 0 32 32"
          fill="none"
          className="h-5 w-5 text-gold transition-all duration-300 group-hover:scale-110 group-hover:text-gold-light"
        >
          <circle cx="9" cy="23" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <circle cx="23" cy="23" r="3.2" stroke="currentColor" strokeWidth="1.6" />
          <line x1="9" y1="23" x2="25" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <line x1="23" y1="23" x2="7" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          <circle cx="16" cy="16" r="1.15" fill="currentColor" />
        </svg>
      </span>
      <span className="font-display text-2xl font-semibold tracking-[0.2em] text-cream">MOATSEM</span>
    </Link>
  );
}

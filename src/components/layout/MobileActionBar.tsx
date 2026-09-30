"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ArrowUpIcon } from "@/components/ui/Icons";
import { useLocale } from "@/i18n/LocaleProvider";

function scrollToTop() {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
}

/**
 * Phone-only sticky bottom bar with the two main actions. It stays out of the
 * way when it isn't needed: hidden while the hero's own buttons or the
 * booking flow (which has its own step bar) are on screen, and while the
 * on-screen keyboard is up. A spacer after it reserves its height so it never
 * covers the end of the page.
 */
export function MobileActionBar({ page }: { page: "home" | "manage" }) {
  const { dict } = useLocale();
  const [coveredBy, setCoveredBy] = useState({ hero: page === "home", booking: false });
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    if (page !== "home") return;
    const heroActions = document.querySelector("[data-hero-actions]");
    const booking = document.getElementById("booking");
    // The top margin excludes the strip behind the sticky header: hero buttons
    // tucked under the header count as scrolled away.
    const headerHeight = document.querySelector("header")?.getBoundingClientRect().height ?? 0;
    const observer = new IntersectionObserver(
      (entries) => {
        setCoveredBy((previous) => {
          const next = { ...previous };
          for (const entry of entries) {
            if (entry.target === heroActions) next.hero = entry.isIntersecting;
            if (entry.target === booking) next.booking = entry.isIntersecting;
          }
          return next;
        });
      },
      { rootMargin: `-${Math.round(headerHeight)}px 0px 0px 0px` },
    );
    if (heroActions) observer.observe(heroActions);
    if (booking) observer.observe(booking);
    return () => observer.disconnect();
  }, [page]);

  useEffect(() => {
    const isField = (target: EventTarget | null) =>
      target instanceof HTMLElement && target.matches("input, textarea, select, [contenteditable='true']");
    const onFocusIn = (event: FocusEvent) => isField(event.target) && setIsTyping(true);
    const onFocusOut = (event: FocusEvent) => isField(event.target) && setIsTyping(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  const isVisible = !coveredBy.hero && !coveredBy.booking && !isTyping;

  return (
    <>
      {/* Reserves the bar's height at the end of the page on phones. */}
      <div aria-hidden="true" className="h-[calc(var(--bottom-bar-height)+env(safe-area-inset-bottom))] lg:hidden" />
      <nav
        aria-label={dict.nav.quickActionsLabel}
        inert={!isVisible}
        className={`fixed inset-x-0 bottom-0 z-50 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] shadow-raised backdrop-blur-md transition-transform duration-200 ease-out lg:hidden ${
          isVisible ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="container-page flex h-[var(--bottom-bar-height)] items-center gap-2">
          <Button href="/#booking" variant="primary" className="flex-1">
            {dict.nav.bookNow}
          </Button>
          {page === "home" ? (
            <>
              <Button href="/manage-booking" variant="secondary" className="flex-1">
                {dict.nav.manageBooking}
              </Button>
              <button
                type="button"
                onClick={scrollToTop}
                aria-label={dict.nav.backToTop}
                className="inline-flex h-12 w-12 shrink-0 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-surface text-fg"
              >
                <ArrowUpIcon />
              </button>
            </>
          ) : null}
        </div>
      </nav>
    </>
  );
}

/** Desktop-only floating "back to top" button, shown after scrolling down a screen. */
export function BackToTopButton() {
  const { dict } = useLocale();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let frame = 0;
    const onScroll = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setIsVisible(window.scrollY > window.innerHeight));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={scrollToTop}
      aria-label={dict.nav.backToTop}
      inert={!isVisible}
      className={`fixed end-6 bottom-6 z-[45] hidden h-12 w-12 cursor-pointer items-center justify-center rounded-full border border-border-strong bg-surface text-fg shadow-raised transition-opacity duration-200 hover:bg-surface-2 lg:inline-flex ${
        isVisible ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <ArrowUpIcon />
    </button>
  );
}

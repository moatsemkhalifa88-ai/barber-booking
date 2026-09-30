"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { setLocaleAction } from "./actions";
import { getDictionary, type Dictionary } from "./index";
import { dirForLocale, type Locale } from "./config";

interface LocaleContextValue {
  locale: Locale;
  dir: "ltr" | "rtl";
  dict: Dictionary;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

/** The id of the section the visitor is reading (the one crossing the upper third of the screen), so a language switch can return to it. */
function currentSectionId(): string | null {
  if (window.scrollY < 8) return null;
  const readingLine = window.innerHeight / 3;
  let current: string | null = null;
  for (const section of document.querySelectorAll<HTMLElement>("main section[id]")) {
    if (section.getBoundingClientRect().top <= readingLine) current = section.id;
  }
  return current;
}

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ block: "start", behavior: "instant" });
}

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [isRefreshing, startRefresh] = useTransition();
  const anchorRef = useRef<string | null>(null);
  const router = useRouter();

  function setLocale(next: Locale) {
    if (next === locale) return;
    anchorRef.current = currentSectionId();

    // Flip language and direction immediately for a snappy switch, then
    // persist the cookie and re-render the server-rendered sections (which
    // read the cookie) via router.refresh(). Client state such as an
    // in-progress booking survives the refresh.
    setLocaleState(next);
    document.documentElement.lang = next;
    document.documentElement.dir = dirForLocale(next);
    if (anchorRef.current) scrollToSection(anchorRef.current);

    startRefresh(async () => {
      await setLocaleAction(next);
      router.refresh();
    });
  }

  // Server-rendered sections change height once the refresh lands, so
  // re-anchor to the same section afterwards.
  useEffect(() => {
    if (!isRefreshing && anchorRef.current) {
      scrollToSection(anchorRef.current);
      anchorRef.current = null;
    }
  }, [isRefreshing]);

  const value = useMemo<LocaleContextValue>(
    () => ({ locale, dir: dirForLocale(locale), dict: getDictionary(locale), setLocale }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale(): LocaleContextValue {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error("useLocale must be used within a LocaleProvider");
  return ctx;
}

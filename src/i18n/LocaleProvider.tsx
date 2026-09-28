"use client";

import { createContext, useContext, useMemo, useState, type ReactNode } from "react";
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

export function LocaleProvider({ initialLocale, children }: { initialLocale: Locale; children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const router = useRouter();

  function setLocale(next: Locale) {
    if (next === locale) return;
    // Update immediately for a snappy switcher, then persist the cookie and
    // re-render server-rendered sections (which read the cookie directly)
    // via router.refresh().
    setLocaleState(next);
    void setLocaleAction(next).then(() => router.refresh());
  }

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

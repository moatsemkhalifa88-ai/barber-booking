"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { useLocale } from "@/i18n/LocaleProvider";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { dict } = useLocale();

  const navLinks = [
    { label: dict.nav.home, href: "/#home" },
    { label: dict.nav.services, href: "/#services" },
    { label: dict.nav.barbers, href: "/#barbers" },
    { label: dict.nav.gallery, href: "/#gallery" },
    { label: dict.nav.booking, href: "/#booking" },
    { label: dict.nav.manageBooking, href: "/manage-booking" },
    { label: dict.nav.contact, href: "/#contact" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="container-page flex h-[var(--header-height)] items-center justify-between gap-3">
        <Logo />

        <nav
          aria-label={dict.nav.primaryMenuLabel}
          className="hidden items-center gap-5 xl:gap-8 lg:flex"
        >
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="whitespace-nowrap text-[15px] font-semibold text-fg transition-colors duration-150 hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-4 lg:flex">
          <LanguageSwitcher />
          <Button href="/#booking" variant="primary">
            {dict.nav.bookNow}
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
        <button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-border-strong text-fg"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label={isMenuOpen ? dict.nav.closeMenu : dict.nav.openMenu}
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span className="sr-only">{isMenuOpen ? dict.nav.closeMenu : dict.nav.openMenu}</span>
          <svg
            width="18"
            height="14"
            viewBox="0 0 18 14"
            fill="none"
            aria-hidden="true"
          >
            {isMenuOpen ? (
              <>
                <line x1="1" y1="1" x2="17" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="17" y1="1" x2="1" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </>
            ) : (
              <>
                <line x1="0" y1="1" x2="18" y2="1" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="0" y1="7" x2="18" y2="7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                <line x1="0" y1="13" x2="18" y2="13" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </>
            )}
          </svg>
        </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        className={`grid overflow-hidden border-t border-border bg-surface transition-[grid-template-rows] duration-300 ease-out lg:hidden ${
          isMenuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <nav aria-label={dict.nav.mobileMenuLabel} className="min-h-0">
          <ul className="flex flex-col gap-1 px-6 py-4">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="block rounded-lg px-3 py-3 text-base font-medium text-fg transition-colors hover:bg-surface-2 hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li className="flex justify-center pt-2 pb-1">
              <LanguageSwitcher />
            </li>
            <li className="pt-2">
              <Button
                href="/#booking"
                variant="primary"
                className="w-full"
                onClick={() => setIsMenuOpen(false)}
              >
                {dict.nav.bookNow}
              </Button>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

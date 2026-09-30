"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/Button";
import { Logo } from "@/components/layout/Logo";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { CloseIcon, ForwardIcon, MenuIcon } from "@/components/ui/Icons";
import { useLocale } from "@/i18n/LocaleProvider";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { dict } = useLocale();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const desktopLinks = [
    { label: dict.nav.services, href: "/#services" },
    { label: dict.nav.barbers, href: "/#barbers" },
    { label: dict.nav.hours, href: "/#hours" },
    { label: dict.nav.contact, href: "/#contact" },
    { label: dict.nav.manageBooking, href: "/manage-booking" },
  ];

  const menuLinks = [
    { label: dict.nav.booking, href: "/#booking" },
    { label: dict.nav.manageBooking, href: "/manage-booking" },
    { label: dict.nav.services, href: "/#services" },
    { label: dict.nav.barbers, href: "/#barbers" },
    { label: dict.nav.hours, href: "/#hours" },
    { label: dict.nav.contact, href: "/#contact" },
  ];

  // While the full-screen menu is open: lock page scroll, trap focus inside, close on Escape.
  useEffect(() => {
    if (!isMenuOpen) return;
    const menu = menuRef.current;
    const toggle = toggleRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusables = () =>
      Array.from(menu?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);
    focusables()[0]?.focus();

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMenuOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
      toggle?.focus({ preventScroll: true });
    };
  }, [isMenuOpen]);

  return (
    <>
    <header className="sticky top-0 z-40 border-b border-border bg-surface/90 pt-[env(safe-area-inset-top)] backdrop-blur-md">
      <div className="container-page flex h-[var(--header-height)] items-center justify-between gap-3">
        <Logo />

        <nav aria-label={dict.nav.primaryMenuLabel} className="hidden items-center gap-6 lg:flex xl:gap-8">
          {desktopLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="text-[15px] font-semibold whitespace-nowrap text-fg transition-colors duration-150 hover:text-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <LanguageSwitcher />
          <Button href="/#booking" variant="primary">
            {dict.nav.bookNow}
          </Button>
        </div>

        <div className="flex items-center gap-2 lg:hidden">
          <LanguageSwitcher />
          <button
            ref={toggleRef}
            type="button"
            className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-surface text-fg"
            aria-expanded={isMenuOpen}
            aria-controls="mobile-menu"
            aria-label={dict.nav.openMenu}
            onClick={() => setIsMenuOpen(true)}
          >
            <MenuIcon className="h-6 w-6" />
          </button>
        </div>
      </div>

    </header>

      {/* Portalled to <body>: the header's backdrop blur would otherwise trap this fixed overlay inside the header. */}
      {isMenuOpen
        ? createPortal(
        <div
          ref={menuRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label={dict.nav.mobileMenuLabel}
          className="fixed inset-0 z-[60] flex h-dvh flex-col bg-canvas pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] lg:hidden"
        >
          <div className="container-page flex h-[var(--header-height)] shrink-0 items-center justify-between gap-3 border-b border-border">
            <Logo />
            <button
              type="button"
              className="inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-md border border-border-strong bg-surface text-fg"
              aria-label={dict.nav.closeMenu}
              onClick={() => setIsMenuOpen(false)}
            >
              <CloseIcon className="h-6 w-6" />
            </button>
          </div>

          <nav aria-label={dict.nav.mobileMenuLabel} className="container-page flex-1 overflow-y-auto py-2">
            <ul className="flex flex-col">
              {menuLinks.map((link) => (
                <li key={link.href} className="border-b border-border">
                  <a
                    href={link.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="flex min-h-14 items-center justify-between gap-3 text-xl font-bold text-fg"
                  >
                    {link.label}
                    <ForwardIcon className="h-5 w-5 text-muted" />
                  </a>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between gap-3 py-5">
              <span className="text-base font-semibold text-muted">{dict.nav.languageLabel}</span>
              <LanguageSwitcher />
            </div>
          </nav>

          <div className="container-page shrink-0 border-t border-border py-3">
            <Button href="/#booking" variant="primary" className="w-full" onClick={() => setIsMenuOpen(false)}>
              {dict.nav.bookNow}
            </Button>
          </div>
        </div>,
            document.body,
          )
        : null}
    </>
  );
}

import { Bidi } from "@/components/ui/Bidi";
import { MailIcon } from "@/components/ui/Icons";
import { nowInShopTimezone } from "@/lib/booking/datetime";
import type { Dictionary } from "@/i18n";

const AUTHOR_EMAIL = "moatsem.khalifa88@gmail.com";

// CC BY 2.0 requires visible attribution (see public/images/CREDITS.md).
const ccPhotoCredit = {
  title: "Attractive hairdresser is shaving male beard with the knife",
  sourceUrl: "https://www.flickr.com/photos/nenadstojkovic/48987723271/",
  author: "Nenad Stojkovic",
  license: "CC BY 2.0",
  licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
};

export function Footer({ dict }: { dict: Dictionary }) {
  const navLinks = [
    { label: dict.nav.home, href: "/#home" },
    { label: dict.nav.services, href: "/#services" },
    { label: dict.nav.barbers, href: "/#barbers" },
    { label: dict.nav.gallery, href: "/#gallery" },
    { label: dict.nav.booking, href: "/#booking" },
    { label: dict.nav.manageBooking, href: "/manage-booking" },
  ];

  const dayOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
  const openDays = new Set(["sunday", "monday", "tuesday", "wednesday", "thursday"]);

  return (
    <footer className="border-t border-border bg-surface-2">
      <div className="container-page grid gap-10 py-12 md:grid-cols-4 lg:py-16">
        <div className="flex flex-col gap-4 md:col-span-2">
          <span dir="ltr" className="font-display text-2xl font-bold tracking-[0.16em] text-fg">
            MOATSEM
          </span>
          <p className="max-w-sm text-sm leading-relaxed text-muted">{dict.footer.tagline}</p>
          <div className="mt-2 flex flex-col gap-1">
            <span className="text-sm font-semibold text-fg">{dict.footer.builtBy}</span>
            <a
              href={`mailto:${AUTHOR_EMAIL}`}
              aria-label={`${dict.footer.contactLabel}: ${AUTHOR_EMAIL}`}
              className="inline-flex min-h-11 items-center gap-2 self-start text-base font-semibold text-accent underline-offset-4 hover:underline"
            >
              <MailIcon className="h-5 w-5 shrink-0" />
              <bdi>{AUTHOR_EMAIL}</bdi>
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-accent">
            {dict.footer.navigate}
          </h3>
          <ul className="flex flex-col">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="inline-flex min-h-11 items-center text-base text-muted transition-colors duration-150 hover:text-accent"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-accent">
            {dict.footer.hours}
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            {dayOrder.map((day) => {
              const isOpen = openDays.has(day);
              return (
                <li key={day} className="flex justify-between gap-4">
                  <span>{dict.workingHours.days[day].short}</span>
                  <span className={isOpen ? "text-fg" : "text-muted"}>
                    {isOpen ? <Bidi>{dict.workingHours.hoursLabel}</Bidi> : dict.workingHours.closedLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="container-page flex flex-col gap-2 py-6 text-center text-xs text-muted">
          <p>
            {dict.footer.photoCreditsLabel}{" "}
            <a
              href={ccPhotoCredit.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent"
            >
              <bdi>“{ccPhotoCredit.title}”</bdi>
            </a>{" "}
            {dict.footer.photoCreditBy} <bdi>{ccPhotoCredit.author}</bdi>,{" "}
            <a
              href={ccPhotoCredit.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-accent"
            >
              <bdi>{ccPhotoCredit.license}</bdi>
            </a>
            . {dict.footer.otherPhotosCredit}
          </p>
          <p>
            &copy; <Bidi>{nowInShopTimezone().date.slice(0, 4)}</Bidi> MOATSEM. {dict.footer.rightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}

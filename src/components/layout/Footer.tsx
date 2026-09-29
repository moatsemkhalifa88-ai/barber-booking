import { Bidi } from "@/components/ui/Bidi";
import type { Dictionary } from "@/i18n";

// Author profile links. An entry with an empty href is not rendered.
const profileLinks = [
  { label: "GitHub", href: "" },
  { label: "LinkedIn", href: "" },
].filter((link) => link.href);

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
  ];

  const dayOrder = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"] as const;
  const openDays = new Set(["sunday", "monday", "tuesday", "wednesday", "thursday"]);

  return (
    <footer className="border-t border-line/80 bg-charcoal">
      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-16 sm:px-8 md:grid-cols-4 lg:px-12">
        <div className="flex flex-col gap-4 md:col-span-2">
          <span className="font-display text-2xl font-semibold tracking-[0.2em] text-cream">
            MOATSEM
          </span>
          <p className="max-w-sm text-sm leading-relaxed text-muted">{dict.footer.tagline}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
            <span className="text-cream">{dict.footer.builtBy}</span>
            {profileLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted underline-offset-4 transition-colors duration-200 hover:text-gold-light hover:underline"
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
            {dict.footer.navigate}
          </h3>
          <ul className="flex flex-col gap-2.5">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="text-sm text-muted transition-colors duration-200 hover:text-gold-light"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex flex-col gap-4">
          <h3 className="text-xs font-semibold tracking-[0.3em] text-gold uppercase">
            {dict.footer.hours}
          </h3>
          <ul className="flex flex-col gap-2 text-sm text-muted">
            {dayOrder.map((day) => {
              const isOpen = openDays.has(day);
              return (
                <li key={day} className="flex justify-between gap-4">
                  <span>{dict.workingHours.days[day].short}</span>
                  <span className={isOpen ? "text-cream" : "text-muted"}>
                    {isOpen ? <Bidi>{dict.workingHours.hoursLabel}</Bidi> : dict.workingHours.closedLabel}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="border-t border-line/80">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-6 py-6 text-center text-xs text-muted sm:px-8 lg:px-12">
          <p>
            {dict.footer.photoCreditsLabel}{" "}
            <a
              href={ccPhotoCredit.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-gold-light"
            >
              <bdi>“{ccPhotoCredit.title}”</bdi>
            </a>{" "}
            {dict.footer.photoCreditBy} <bdi>{ccPhotoCredit.author}</bdi>,{" "}
            <a
              href={ccPhotoCredit.licenseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 hover:text-gold-light"
            >
              <bdi>{ccPhotoCredit.license}</bdi>
            </a>
            . {dict.footer.otherPhotosCredit}
          </p>
          <p>
            &copy; <Bidi>{new Date().getFullYear()}</Bidi> MOATSEM. {dict.footer.rightsReserved}
          </p>
        </div>
      </div>
    </footer>
  );
}

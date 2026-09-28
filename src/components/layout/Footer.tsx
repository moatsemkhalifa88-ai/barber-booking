import { Bidi } from "@/components/ui/Bidi";
import type { Dictionary } from "@/i18n";

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
            {dict.footer.visitUs}
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
          <p className="mt-2 text-sm text-muted">
            <Bidi>{dict.footer.phone}</Bidi>
          </p>
          <p className="text-sm text-muted">{dict.footer.address}</p>
        </div>
      </div>

      <div className="border-t border-line/80">
        <div className="mx-auto max-w-7xl px-6 py-6 text-center text-xs text-muted sm:px-8 lg:px-12">
          &copy; <Bidi>{new Date().getFullYear()}</Bidi> MOATSEM. {dict.footer.rightsReserved}
        </div>
      </div>
    </footer>
  );
}

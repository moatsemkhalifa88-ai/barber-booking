import Image from "next/image";
import { QuickBookCard } from "@/components/booking/QuickBookCard";
import type { Dictionary } from "@/i18n";

/**
 * Full-bleed hero: the barber photo covers the whole section (edge to edge,
 * right under the header) behind a dark scrim (.hero-scrim in globals.css:
 * 55% solid, stronger on the text side). Headline, short text, the
 * quick-booking card and the stats sit on top, on the start side (right in
 * Hebrew, left in English). On a phone the content sits at the bottom so the
 * barber's face and hands stay visible above it, and the headline and the
 * card's "Book" button fit on the first screen.
 */
export function Hero({ dict }: { dict: Dictionary }) {
  const stats = [
    { key: "barbers", value: dict.hero.statBarbersValue, label: dict.hero.statBarbersLabel, valueFirst: true },
    { key: "services", value: dict.hero.statServicesValue, label: dict.hero.statServicesLabel, valueFirst: true },
    { key: "open", value: dict.hero.statOpenDaysValue, label: dict.hero.statOpenDaysLabel, valueFirst: false },
  ];

  return (
    <section id="home" data-hero className="tone-dark relative isolate overflow-hidden bg-ink text-on-ink">
      {/* Face and hands sit around 40–62% across, 10–35% down in the photo. On desktop the
          photo box is 125% wide and anchored to the start edge, which moves the barber
          away from the text column (right in English, left in Hebrew). */}
      <div className="absolute inset-y-0 start-0 -z-20 w-full lg:w-[125%]">
        <Image
          src="/images/hero/hero-barbershop.jpg"
          alt={dict.hero.imageAlt}
          fill
          preload
          sizes="(min-width: 1024px) 125vw, 100vw"
          quality={75}
          className="object-cover object-[52%_18%] lg:object-[50%_28%]"
        />
      </div>
      <div aria-hidden="true" className="hero-scrim absolute inset-0 -z-10" />

      <div className="container-page flex min-h-[calc(100svh-var(--header-height)-40px)] flex-col justify-end pt-28 pb-6 lg:min-h-[86svh] lg:justify-center lg:py-16">
        <div className="flex max-w-xl flex-col items-start gap-4 lg:gap-6">
          <h1 className="font-display text-[56px] leading-[0.95] font-bold text-balance lg:text-[68px] xl:text-[76px]">
            <span className="block">{dict.hero.titleLead}</span>
            <span className="block text-brand">{dict.hero.titleHighlight}</span>
          </h1>

          <p className="max-w-lg text-base leading-relaxed text-on-ink sm:text-lg">
            <span className="sm:hidden">{dict.hero.subtitleShort}</span>
            <span className="hidden sm:inline">{dict.hero.subtitle}</span>
          </p>

          <QuickBookCard />

          {/* One line, number first: "3 ספרים · 3 שירותים · פתוח א׳–ה׳". */}
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-on-ink sm:text-base">
            {stats.map((stat, index) => (
              <li key={stat.key} className="flex items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-on-ink-muted">
                    ·
                  </span>
                ) : null}
                <span>
                  {stat.valueFirst ? (
                    <>
                      <strong className="font-bold">{stat.value}</strong> {stat.label}
                    </>
                  ) : (
                    <>
                      {stat.label}{" "}
                      {/* <bdi> picks direction from the content: "א׳–ה׳" stays RTL, "Sun–Thu" LTR. */}
                      <strong className="font-bold">
                        <bdi>{stat.value}</bdi>
                      </strong>
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

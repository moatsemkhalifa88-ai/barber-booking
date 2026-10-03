import Image from "next/image";
import { QuickBookCard } from "@/components/booking/QuickBookCard";
import type { Dictionary } from "@/i18n";

/**
 * Dark hero: big barber photo, condensed display headline (second line in the
 * orange accent), a short line, and the quick-booking card. On a phone the
 * photo, headline and the card's "Book" button all fit on the first screen.
 */
export function Hero({ dict }: { dict: Dictionary }) {
  const stats = [
    { key: "barbers", value: dict.hero.statBarbersValue, label: dict.hero.statBarbersLabel, valueFirst: true },
    { key: "services", value: dict.hero.statServicesValue, label: dict.hero.statServicesLabel, valueFirst: true },
    { key: "open", value: dict.hero.statOpenDaysValue, label: dict.hero.statOpenDaysLabel, valueFirst: false },
  ];

  return (
    <section id="home" data-hero className="tone-dark bg-ink text-on-ink">
      <div className="container-page grid items-center gap-5 pt-4 pb-8 lg:min-h-[calc(100svh-var(--header-height)-40px)] lg:grid-cols-[1fr_1fr] lg:gap-14 lg:py-14">
        <div className="relative order-first h-[clamp(170px,27svh,320px)] overflow-hidden rounded-lg lg:order-last lg:h-full lg:max-h-[680px] lg:min-h-[520px]">
          <Image
            src="/images/hero/hero-barbershop.jpg"
            alt={dict.hero.imageAlt}
            fill
            preload
            sizes="(min-width: 1024px) 50vw, 100vw"
            quality={75}
            className="object-cover object-[70%_35%]"
          />
        </div>

        <div className="flex flex-col items-start gap-4 lg:gap-6">
          <h1 className="font-display text-[56px] leading-[0.95] font-bold text-balance lg:text-[64px] xl:text-[72px]">
            <span className="block">{dict.hero.titleLead}</span>
            <span className="block text-brand">{dict.hero.titleHighlight}</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-on-ink-muted sm:text-lg">
            <span className="sm:hidden">{dict.hero.subtitleShort}</span>
            <span className="hidden sm:inline">{dict.hero.subtitle}</span>
          </p>

          <QuickBookCard />

          {/* One line, number first: "3 ספרים · 3 שירותים · פתוח א׳–ה׳". */}
          <ul className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[15px] text-on-ink-muted sm:text-base">
            {stats.map((stat, index) => (
              <li key={stat.key} className="flex items-center gap-2">
                {index > 0 ? (
                  <span aria-hidden="true" className="text-on-ink-muted/60">
                    ·
                  </span>
                ) : null}
                <span>
                  {stat.valueFirst ? (
                    <>
                      <strong className="font-bold text-on-ink">{stat.value}</strong> {stat.label}
                    </>
                  ) : (
                    <>
                      {stat.label}{" "}
                      {/* <bdi> picks direction from the content: "א׳–ה׳" stays RTL, "Sun–Thu" LTR. */}
                      <strong className="font-bold text-on-ink">
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

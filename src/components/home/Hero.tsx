import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n";

/**
 * Mobile-first hero: photo, headline, short subtitle and both buttons fit on
 * the first screen of a phone (sized with svh, which excludes the browser
 * toolbars). On desktop the text and photo sit side by side.
 */
export function Hero({ dict }: { dict: Dictionary }) {
  const stats = [
    [dict.hero.statBarbersLabel, dict.hero.statBarbersValue],
    [dict.hero.statServicesLabel, dict.hero.statServicesValue],
    [dict.hero.statOpenDaysLabel, dict.hero.statOpenDaysValue],
  ];

  return (
    <section id="home" data-hero className="border-b border-border bg-canvas">
      <div className="container-page grid items-center gap-5 pt-4 pb-7 lg:min-h-[calc(100svh-var(--header-height)-40px)] lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-12">
        <div className="relative order-first h-[clamp(190px,32svh,340px)] overflow-hidden rounded-xl shadow-card lg:order-last lg:h-auto lg:max-h-[640px] lg:min-h-[480px] lg:self-stretch">
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

        <div className="flex flex-col items-start gap-3 sm:gap-5">
          <span className="rounded-full bg-accent-soft px-3 py-1 text-sm font-semibold text-accent">{dict.hero.badge}</span>

          <h1 className="font-display text-[2.125rem] leading-[1.12] font-bold text-balance text-fg sm:text-5xl lg:text-[3.5rem]">
            {dict.hero.titleLead} <span className="text-accent">{dict.hero.titleHighlight}</span>
          </h1>

          <p className="max-w-xl text-base leading-relaxed text-muted sm:text-lg">
            <span className="sm:hidden">{dict.hero.subtitleShort}</span>
            <span className="hidden sm:inline">{dict.hero.subtitle}</span>
          </p>

          <div data-hero-actions className="mt-1 grid w-full grid-cols-2 gap-3 sm:flex sm:w-auto">
            <Button href="#booking" variant="primary">
              {dict.hero.ctaBook}
            </Button>
            <Button href="#services" variant="secondary">
              {dict.hero.ctaServices}
            </Button>
          </div>

          <dl className="mt-3 hidden gap-10 border-t border-border pt-5 sm:flex">
            {stats.map(([label, value]) => (
              <div key={label} className="flex flex-col gap-0.5">
                <dt className="text-sm text-muted">{label}</dt>
                <dd className="font-display text-2xl font-bold text-fg">
                  {/* <bdi> picks direction from the content: "א׳–ה׳" stays RTL, "Sun–Thu" LTR. */}
                  <bdi>{value}</bdi>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}

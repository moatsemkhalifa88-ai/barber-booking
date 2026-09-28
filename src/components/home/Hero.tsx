import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Bidi } from "@/components/ui/Bidi";
import type { Dictionary } from "@/i18n";

export function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section
      id="home"
      className="relative scroll-mt-24 overflow-hidden border-b border-line/80"
    >
      <Image
        src="/images/hero/hero-barbershop.jpg"
        alt="A barber in a dimly lit, upscale barbershop trimming a client's beard with scissors"
        fill
        preload
        sizes="100vw"
        quality={75}
        className="object-cover object-[75%_30%]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-10%,rgba(201,162,75,0.16),transparent_55%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(9,9,10,0.05)_0%,rgba(9,9,10,0.15)_55%,var(--color-ink)_100%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(100deg,rgba(9,9,10,0.92)_0%,rgba(9,9,10,0.6)_35%,rgba(9,9,10,0.15)_65%,transparent_85%)]"
      />
      <span
        aria-hidden="true"
        className="font-display pointer-events-none absolute top-1/2 left-1/2 -z-0 -translate-x-1/2 -translate-y-1/2 text-[38vw] leading-none font-semibold text-cream/[0.03] select-none"
      >
        M
      </span>

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center gap-10 px-6 py-32 sm:px-8 lg:px-12">
        {/* Pinned to the physical left in both languages: the background
            photo's subject sits at object-position 75% (right side), so the
            text block stays on the opposite side rather than mirroring with
            the page direction. */}
        <div className="flex flex-col items-start gap-7 rtl:items-end">
          <span className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-1.5 text-xs font-semibold tracking-[0.3em] text-gold uppercase">
            {dict.hero.badge}
          </span>

          <h1 className="font-display max-w-4xl text-5xl leading-[1.05] text-cream sm:text-6xl md:text-7xl">
            {dict.hero.titleLead} <span className="text-gold">{dict.hero.titleHighlight}</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-muted sm:text-xl">{dict.hero.subtitle}</p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row">
            <Button href="#booking" variant="primary">
              {dict.hero.ctaBook}
            </Button>
            <Button href="#services" variant="secondary">
              {dict.hero.ctaServices}
            </Button>
          </div>
        </div>

        <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-6 border-t border-line/80 pt-8">
          <div className="flex flex-col gap-1">
            <dt className="text-xs tracking-[0.25em] text-muted uppercase">{dict.hero.statBarbersLabel}</dt>
            <dd className="font-display text-2xl text-cream sm:text-3xl">
              <Bidi>{dict.hero.statBarbersValue}</Bidi>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs tracking-[0.25em] text-muted uppercase">{dict.hero.statServicesLabel}</dt>
            <dd className="font-display text-2xl text-cream sm:text-3xl">
              <Bidi>{dict.hero.statServicesValue}</Bidi>
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs tracking-[0.25em] text-muted uppercase">{dict.hero.statOpenDaysLabel}</dt>
            <dd className="font-display text-2xl text-cream sm:text-3xl">{dict.hero.statOpenDaysValue}</dd>
          </div>
        </dl>
      </div>
    </section>
  );
}

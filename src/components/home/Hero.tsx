import Image from "next/image";
import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n";

export function Hero({ dict }: { dict: Dictionary }) {
  return (
    <section id="home" className="relative overflow-hidden bg-primary">
      <Image
        src="/images/hero/hero-barbershop.jpg"
        alt={dict.hero.imageAlt}
        fill
        preload
        sizes="100vw"
        quality={75}
        className="object-cover object-[75%_30%]"
      />
      {/* Charcoal scrim keeps white text at ≥ 4.5:1 over any part of the photo. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-primary/70" />

      <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col justify-center gap-10 px-6 py-32 sm:px-8 lg:px-12">
        <div className="flex flex-col items-start gap-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-gold/60 px-4 py-1.5 text-sm font-semibold text-gold">
            {dict.hero.badge}
          </span>

          <h1 className="font-display max-w-4xl text-5xl leading-[1.1] font-bold text-on-primary sm:text-6xl md:text-7xl">
            {dict.hero.titleLead} <span className="text-gold">{dict.hero.titleHighlight}</span>
          </h1>

          <p className="max-w-xl text-lg leading-relaxed text-on-primary/90 sm:text-xl">{dict.hero.subtitle}</p>

          <div className="mt-2 flex flex-col gap-4 sm:flex-row">
            <Button href="#booking" variant="onDark">
              {dict.hero.ctaBook}
            </Button>
            <Button href="#services" variant="outlineOnDark">
              {dict.hero.ctaServices}
            </Button>
          </div>
        </div>

        <dl className="mt-10 grid max-w-2xl grid-cols-3 gap-6 border-t border-on-primary/25 pt-8">
          {[
            [dict.hero.statBarbersLabel, dict.hero.statBarbersValue],
            [dict.hero.statServicesLabel, dict.hero.statServicesValue],
            [dict.hero.statOpenDaysLabel, dict.hero.statOpenDaysValue],
          ].map(([label, value]) => (
            <div key={label} className="flex flex-col gap-1">
              <dt className="text-sm text-on-primary/80">{label}</dt>
              <dd className="font-display text-2xl text-on-primary sm:text-3xl">
                {/* <bdi> picks direction from the content: "א׳–ה׳" stays RTL, "Sun–Thu" LTR. */}
                <bdi>{value}</bdi>
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

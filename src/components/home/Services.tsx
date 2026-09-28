import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Bidi } from "@/components/ui/Bidi";
import { services } from "@/data/services";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/i18n";

export function Services({ dict }: { dict: Dictionary }) {
  return (
    <section id="services" className="scroll-mt-24 border-b border-line/80 bg-charcoal">
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <SectionHeading
          eyebrow={dict.services.eyebrow}
          title={dict.services.title}
          description={dict.services.description}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {services.map((service) => {
            const translated = dict.services.items[service.id];
            const name = translated?.name ?? service.name;
            const description = translated?.description ?? service.description;

            return (
              <article
                key={service.id}
                className="group flex flex-col overflow-hidden rounded-2xl border border-line bg-ink transition-all duration-300 hover:-translate-y-1 hover:border-gold/50 hover:shadow-[0_20px_50px_-20px_rgba(201,162,75,0.35)]"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={`${name} service at MOATSEM barber shop`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,transparent_40%,rgba(9,9,10,0.85)_100%)] transition-opacity duration-300 group-hover:opacity-80"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-6 p-8">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl text-cream">{name}</h3>
                    <span className="shrink-0 rounded-full border border-line px-3 py-1 text-xs font-semibold tracking-wide text-gold-light">
                      <Bidi>
                        {service.durationMinutes} {dict.services.minutesSuffix}
                      </Bidi>
                    </span>
                  </div>

                  <p className="flex-1 text-sm leading-relaxed text-muted">{description}</p>

                  <div className="flex flex-col gap-4 border-t border-line/80 pt-5">
                    <span className="font-display text-2xl text-gold-light">
                      <Bidi>{formatPrice(service.priceIls)}</Bidi>
                    </span>
                    <Button href="#booking" variant="secondary" className="w-full">
                      {dict.services.bookThisService}
                    </Button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

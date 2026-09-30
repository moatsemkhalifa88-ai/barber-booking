import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Bidi } from "@/components/ui/Bidi";
import { services } from "@/data/services";
import { formatPrice } from "@/lib/format";
import { format, type Dictionary, type Locale } from "@/i18n";

export function Services({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section id="services" className="border-b border-border bg-surface-2">
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
                className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface shadow-card transition-shadow duration-200 hover:shadow-raised"
              >
                <div className="relative aspect-[4/3] w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={format(dict.services.imageAlt, { name })}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-6 p-8">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-2xl font-bold text-fg">{name}</h3>
                    <span className="shrink-0 rounded-full border border-border px-3 py-1 text-xs font-semibold text-accent">
                      <bdi>
                        {service.durationMinutes} {dict.services.minutesSuffix}
                      </bdi>
                    </span>
                  </div>

                  <p className="flex-1 text-sm leading-relaxed text-muted">{description}</p>

                  <div className="flex flex-col gap-4 border-t border-border pt-5">
                    <span className="text-2xl font-bold tabular-nums text-accent">
                      <Bidi>{formatPrice(service.priceIls, locale)}</Bidi>
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

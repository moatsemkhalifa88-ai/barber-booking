import Image from "next/image";
import { BookServiceButton } from "@/components/booking/BookServiceButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Bidi } from "@/components/ui/Bidi";
import { services } from "@/data/services";
import { formatPrice } from "@/lib/format";
import { format, type Dictionary, type Locale } from "@/i18n";

export function Services({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section id="services" className="section-y border-b border-border bg-surface-2">
      <div className="container-page flex flex-col gap-8 lg:gap-12">
        <SectionHeading eyebrow={dict.services.eyebrow} title={dict.services.title} description={dict.services.description} />

        {/* Phones: swipe row (each card 80% wide so the next one peeks in). md+: three-column grid. */}
        <div className="swipe-row md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {services.map((service) => {
            const translated = dict.services.items[service.id];
            const name = translated?.name ?? service.name;
            const description = translated?.description ?? service.description;

            return (
              <article
                key={service.id}
                data-reveal=""
                className="service-card relative flex w-[80%] flex-col overflow-hidden rounded-lg border border-border bg-surface sm:w-[46%] md:w-auto"
              >
                <div className="service-card__media relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={service.image}
                    alt={format(dict.services.imageAlt, { name })}
                    fill
                    sizes="(min-width: 768px) 33vw, 80vw"
                    className="object-cover"
                  />
                </div>

                <div className="flex flex-1 flex-col gap-3 p-4 lg:p-6">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="font-display text-xl font-bold text-fg lg:text-2xl">{name}</h3>
                    <span className="service-card__price text-xl font-bold whitespace-nowrap text-accent tabular-nums">
                      <Bidi>{formatPrice(service.priceIls, locale)}</Bidi>
                    </span>
                  </div>
                  <span className="self-start rounded-full bg-surface-2 px-2.5 py-0.5 text-sm font-semibold text-muted">
                    <bdi>
                      {service.durationMinutes} {dict.services.minutesSuffix}
                    </bdi>
                  </span>
                  <p className="line-clamp-2 flex-1 text-[15px] leading-relaxed text-muted">{description}</p>
                  <BookServiceButton serviceName={service.name} label={dict.services.bookThisService} />
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

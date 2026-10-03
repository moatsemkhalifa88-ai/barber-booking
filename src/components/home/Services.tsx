import Image from "next/image";
import { BookServiceLink } from "@/components/booking/BookServiceButton";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { ForwardIcon } from "@/components/ui/Icons";
import { services } from "@/data/services";
import { formatPrice, priceParts } from "@/lib/format";
import { format, type Dictionary, type Locale } from "@/i18n";

/** Price list on beige: name + duration on one side, price in the display face on the other, 1px dividers. Each row books that service. */
export function Services({ dict, locale }: { dict: Dictionary; locale: Locale }) {
  return (
    <section id="services" className="section-y bg-canvas">
      <div className="container-page flex flex-col gap-8 lg:gap-12">
        <SectionHeading eyebrow={dict.services.eyebrow} title={dict.services.title} description={dict.services.description} />

        <ul className="mx-auto w-full max-w-3xl">
          {services.map((service) => {
            const translated = dict.services.items[service.id];
            const name = translated?.name ?? service.name;
            const description = translated?.description ?? service.description;
            const duration = `${service.durationMinutes} ${dict.services.minutesSuffix}`;
            const price = formatPrice(service.priceIls, locale);
            const parts = priceParts(service.priceIls, locale);
            const symbol = <span className="text-xl font-bold">{parts.symbol}</span>;

            return (
              <li key={service.id} data-reveal="" className="border-b border-border first:border-t">
                <BookServiceLink
                  serviceName={service.name}
                  ariaLabel={format(dict.services.bookServiceAria, { name, duration, price })}
                  className="price-row flex min-h-20 items-center gap-4 py-4"
                >
                  <span className="price-row__thumb relative h-16 w-16 shrink-0 overflow-hidden rounded-md sm:h-20 sm:w-20">
                    <Image src={service.image} alt="" fill sizes="80px" className="object-cover" />
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-lg font-bold text-fg sm:text-xl">{name}</span>
                    <span className="text-sm text-muted">
                      <bdi>{duration}</bdi>
                      <span className="hidden sm:inline"> · {description}</span>
                    </span>
                  </span>
                  <span className="flex shrink-0 items-center gap-3">
                    {/* Amount in the display face, ₪ smaller in the body face (Karantina's ₪ is very heavy). */}
                    <span dir="ltr" className="price-row__price inline-flex items-baseline gap-1 text-fg">
                      {parts.symbolFirst ? symbol : null}
                      <span className="font-display text-[40px] leading-none font-bold tabular-nums">{parts.amount}</span>
                      {parts.symbolFirst ? null : symbol}
                    </span>
                    {/* One arrow at every width; the "הזמינו" label joins it from sm up. */}
                    <span className="inline-flex items-center gap-1 text-sm font-bold text-accent">
                      <span className="hidden sm:inline">{dict.services.bookShort}</span>
                      <ForwardIcon className="price-row__arrow h-5 w-5" />
                    </span>
                  </span>
                </BookServiceLink>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { barbers } from "@/data/barbers";
import { format, type Dictionary } from "@/i18n";

/** Barbers on off-white: tall portrait cards with name and role. Hover/focus/tap motion lives in globals.css (.barber-card). */
export function Barbers({ dict }: { dict: Dictionary }) {
  return (
    <section id="barbers" className="section-y bg-surface">
      <div className="container-page flex flex-col gap-8 lg:gap-12">
        <SectionHeading eyebrow={dict.barbers.eyebrow} title={dict.barbers.title} description={dict.barbers.description} />

        {/* Phones: swipe row (each card 70% wide so the next one peeks in). md+: three columns. */}
        <div className="swipe-row md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {barbers.map((barber) => {
            const role = dict.barbers.roleByEnglish[barber.role] ?? barber.role;
            const name = dict.barbers.nameByEnglish[barber.name] ?? barber.name;
            const nameId = `barber-${barber.id}-name`;

            return (
              // Focusable so keyboard users get the same highlight as a mouse hover.
              <article
                key={barber.id}
                data-reveal=""
                tabIndex={0}
                aria-labelledby={nameId}
                className="barber-card relative flex w-[70%] flex-col overflow-hidden rounded-lg border border-border bg-canvas sm:w-[44%] md:w-auto"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden">
                  <Image
                    src={barber.image}
                    alt={format(dict.barbers.imageAlt, { name, role })}
                    fill
                    sizes="(min-width: 768px) 33vw, 70vw"
                    style={{ objectPosition: barber.imagePosition ?? "center 25%" }}
                    className="barber-card__photo object-cover"
                  />
                </div>
                <div className="flex flex-col gap-1 p-4 lg:p-5">
                  <h3 id={nameId} className="font-display text-[34px] leading-[0.95] font-bold text-fg">
                    <span className="barber-card__name pb-1">{name}</span>
                  </h3>
                  <span className={`text-sm font-semibold ${barber.isLead ? "text-accent" : "text-muted"}`}>{role}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

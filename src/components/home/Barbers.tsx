import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { barbers } from "@/data/barbers";
import { format, type Dictionary } from "@/i18n";

export function Barbers({ dict }: { dict: Dictionary }) {
  return (
    <section id="barbers" className="section-y border-b border-border bg-surface">
      <div className="container-page flex flex-col gap-8 lg:gap-12">
        <SectionHeading eyebrow={dict.barbers.eyebrow} title={dict.barbers.title} description={dict.barbers.description} />

        {/* Phones: compact swipe row. md+: three-column grid. */}
        <div className="swipe-row md:mx-0 md:grid md:grid-cols-3 md:gap-6 md:overflow-visible md:px-0">
          {barbers.map((barber) => {
            const bio = dict.barbers.items[barber.id]?.bio ?? barber.bio;
            const role = dict.barbers.roleByEnglish[barber.role] ?? barber.role;
            const name = dict.barbers.nameByEnglish[barber.name] ?? barber.name;
            const nameId = `barber-${barber.id}-name`;

            return (
              // Focusable so keyboard users get the same highlight as a mouse hover (see .barber-card in globals.css).
              <article
                key={barber.id}
                data-reveal=""
                tabIndex={0}
                aria-labelledby={nameId}
                className={`barber-card flex w-[80%] flex-col gap-3 rounded-lg border bg-surface p-4 sm:w-[46%] md:w-auto lg:p-6 ${
                  barber.isLead ? "border-accent" : "border-border"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="barber-card__avatar relative h-16 w-16 shrink-0">
                    <span aria-hidden="true" className="barber-card__ring" />
                    <div
                      className={`relative h-full w-full overflow-hidden rounded-full border-2 ${
                        barber.isLead ? "border-accent" : "border-border"
                      }`}
                    >
                      <Image
                        src={barber.image}
                        alt={format(dict.barbers.imageAlt, { name, role })}
                        fill
                        sizes="64px"
                        style={{ objectPosition: barber.imagePosition ?? "center" }}
                        className="barber-card__photo object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <h3 id={nameId} className="font-display text-xl font-bold text-fg">
                      <span className="barber-card__name">{name}</span>
                    </h3>
                    <span className={`text-sm font-semibold ${barber.isLead ? "text-accent" : "text-muted"}`}>{role}</span>
                  </div>
                </div>
                <p className="line-clamp-3 text-[15px] leading-relaxed text-muted">{bio}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

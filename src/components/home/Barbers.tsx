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

            return (
              <article
                key={barber.id}
                className={`flex w-[80%] flex-col gap-3 rounded-lg border bg-surface p-4 shadow-card sm:w-[46%] md:w-auto lg:p-6 ${
                  barber.isLead ? "border-accent" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-2 ${
                      barber.isLead ? "border-accent" : "border-border"
                    }`}
                  >
                    <Image
                      src={barber.image}
                      alt={format(dict.barbers.imageAlt, { name, role })}
                      fill
                      sizes="64px"
                      style={{ objectPosition: barber.imagePosition ?? "center" }}
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <h3 className="font-display text-xl font-bold text-fg">{name}</h3>
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

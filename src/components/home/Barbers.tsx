import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { barbers } from "@/data/barbers";
import type { Dictionary } from "@/i18n";

export function Barbers({ dict }: { dict: Dictionary }) {
  return (
    <section id="barbers" className="scroll-mt-24 border-b border-line/80 bg-ink">
      <div className="mx-auto flex max-w-7xl flex-col gap-14 px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <SectionHeading
          eyebrow={dict.barbers.eyebrow}
          title={dict.barbers.title}
          description={dict.barbers.description}
        />

        <div className="grid gap-6 md:grid-cols-3">
          {barbers.map((barber) => {
            const bio = dict.barbers.items[barber.id]?.bio ?? barber.bio;
            const role = dict.barbers.roleByEnglish[barber.role] ?? barber.role;

            return (
              <article
                key={barber.id}
                className={`group flex flex-col gap-6 rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                  barber.isLead
                    ? "border-gold/60 bg-gradient-to-b from-charcoal-light to-charcoal shadow-[0_25px_60px_-25px_rgba(201,162,75,0.45)] md:col-span-3 md:flex-row md:items-center md:gap-10 md:p-10 lg:col-span-1 lg:flex-col lg:items-stretch"
                    : "border-line bg-charcoal hover:border-gold/40"
                }`}
              >
                <div className="flex items-center gap-5 md:flex-col md:items-start lg:flex-row">
                  <div
                    className={`relative shrink-0 overflow-hidden rounded-full border ${
                      barber.isLead
                        ? "h-20 w-20 border-gold/60 shadow-[0_0_0_4px_rgba(201,162,75,0.12)] md:h-32 md:w-32 lg:h-20 lg:w-20"
                        : "h-20 w-20 border-line"
                    }`}
                  >
                    <Image
                      src={barber.image}
                      alt={`${barber.name}, ${role} at MOATSEM barber shop`}
                      fill
                      sizes="128px"
                      style={{ objectPosition: barber.imagePosition ?? "center" }}
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-xs font-semibold tracking-[0.12em] whitespace-nowrap uppercase ${
                        barber.isLead ? "text-gold" : "text-muted"
                      }`}
                    >
                      {role}
                    </span>
                    <h3 className="font-display text-2xl text-cream">{barber.name}</h3>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-muted">{bio}</p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

import Image from "next/image";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { barbers } from "@/data/barbers";
import { format, type Dictionary } from "@/i18n";

export function Barbers({ dict }: { dict: Dictionary }) {
  return (
    <section id="barbers" className="border-b border-border bg-surface">
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
            const name = dict.barbers.nameByEnglish[barber.name] ?? barber.name;

            return (
              <article
                key={barber.id}
                className={`group flex flex-col gap-6 rounded-2xl border p-8 transition-all duration-300 hover:-translate-y-1 ${
                  barber.isLead
                    ? "border-accent bg-gradient-to-b from-surface to-surface shadow-card md:col-span-3 md:flex-row md:items-center md:gap-10 md:p-10 lg:col-span-1 lg:flex-col lg:items-stretch"
                    : "border-border bg-surface-2 hover:border-accent"
                }`}
              >
                <div className="flex items-center gap-5 md:flex-col md:items-start lg:flex-row">
                  <div
                    className={`relative shrink-0 overflow-hidden rounded-full border ${
                      barber.isLead
                        ? "h-20 w-20 border-accent md:h-32 md:w-32 lg:h-20 lg:w-20"
                        : "h-20 w-20 border-border"
                    }`}
                  >
                    <Image
                      src={barber.image}
                      alt={format(dict.barbers.imageAlt, { name, role })}
                      fill
                      sizes="128px"
                      style={{ objectPosition: barber.imagePosition ?? "center" }}
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span
                      className={`text-xs font-semibold whitespace-nowrap ${
                        barber.isLead ? "text-accent" : "text-muted"
                      }`}
                    >
                      {role}
                    </span>
                    <h3 className="font-display text-2xl font-bold text-fg">{name}</h3>
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

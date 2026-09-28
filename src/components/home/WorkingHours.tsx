import { SectionHeading } from "@/components/ui/SectionHeading";
import { Bidi } from "@/components/ui/Bidi";
import { weekHours } from "@/data/working-hours";
import type { Dictionary } from "@/i18n";

export function WorkingHours({ dict }: { dict: Dictionary }) {
  return (
    <section className="border-b border-line/80 bg-ink">
      <div className="mx-auto flex max-w-4xl flex-col items-center gap-12 px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
        <SectionHeading eyebrow={dict.workingHours.eyebrow} title={dict.workingHours.title} />

        <dl className="w-full max-w-xl divide-y divide-line rounded-2xl border border-line bg-charcoal">
          {weekHours.map((day) => (
            <div
              key={day.day}
              className="flex items-center justify-between gap-4 px-6 py-4"
            >
              <dt className="text-sm font-medium text-cream">{dict.workingHours.days[day.day].label}</dt>
              <dd
                className={`text-sm font-semibold tracking-wide ${
                  day.isOpen ? "text-gold-light" : "text-muted"
                }`}
              >
                {day.isOpen ? <Bidi>{dict.workingHours.hoursLabel}</Bidi> : dict.workingHours.closedLabel}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

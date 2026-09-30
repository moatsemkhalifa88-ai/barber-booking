import { SectionHeading } from "@/components/ui/SectionHeading";
import { Bidi } from "@/components/ui/Bidi";
import { weekHours } from "@/data/working-hours";
import { dayOfWeekForDate, nowInShopTimezone } from "@/lib/booking/datetime";
import type { Dictionary } from "@/i18n";

export function WorkingHours({ dict }: { dict: Dictionary }) {
  // weekHours is ordered Sunday (0) … Saturday (6), matching dayOfWeekForDate.
  const todayIndex = dayOfWeekForDate(nowInShopTimezone().date);

  return (
    <section id="hours" className="section-y border-b border-border bg-surface">
      <div className="container-page flex flex-col items-center gap-8">
        <SectionHeading eyebrow={dict.workingHours.eyebrow} title={dict.workingHours.title} />

        <dl className="w-full max-w-md divide-y divide-border overflow-hidden rounded-lg border border-border bg-canvas">
          {weekHours.map((day, index) => {
            const isToday = index === todayIndex;
            return (
              <div
                key={day.day}
                className={`flex min-h-12 items-center justify-between gap-4 px-4 ${isToday ? "bg-accent-soft" : ""}`}
              >
                <dt className={`flex items-center gap-2 text-base ${isToday ? "font-bold text-fg" : "text-fg"}`}>
                  {dict.workingHours.days[day.day].label}
                  {isToday ? (
                    <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-bold text-on-primary">
                      {dict.workingHours.todayLabel}
                    </span>
                  ) : null}
                </dt>
                <dd className={`text-base font-semibold tabular-nums ${day.isOpen ? "text-fg" : "text-muted"}`}>
                  {day.isOpen ? <Bidi>{dict.workingHours.hoursLabel}</Bidi> : dict.workingHours.closedLabel}
                </dd>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}

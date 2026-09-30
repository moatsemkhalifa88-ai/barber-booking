import type { ReactNode } from "react";
import type { Dictionary } from "@/i18n";

const pillarIcons: ReactNode[] = [
  // Precision: a ruler-like line with ticks.
  <path key="precision" d="M3 16.5L16.5 3l4.5 4.5L7.5 21 3 16.5zM7.5 12l2 2M10.5 9l2 2M13.5 6l2 2" />,
  // Personal care: a person.
  <path key="care" d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21a8 8 0 0 1 16 0" />,
  // High standards: a star.
  <path key="standard" d="M12 3l2.6 5.6 6.1.7-4.5 4.2 1.2 6L12 16.6 6.6 19.5l1.2-6-4.5-4.2 6.1-.7L12 3z" />,
];

export function About({ dict }: { dict: Dictionary }) {
  return (
    <section id="about" className="section-y border-b border-border bg-surface">
      <div className="container-page grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-semibold text-accent">{dict.about.eyebrow}</span>
          <h2 className="font-display text-[1.75rem] leading-tight font-bold text-balance text-fg sm:text-4xl lg:text-[2.5rem]">
            {dict.about.title}
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">{dict.about.description}</p>
        </div>

        <ul className="flex flex-col gap-3">
          {dict.about.pillars.map((pillar, index) => (
            <li key={pillar.title} className="flex gap-4 rounded-lg border border-border bg-canvas p-4">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-accent-soft text-accent">
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  {pillarIcons[index]}
                </svg>
              </span>
              <div className="flex flex-col gap-0.5">
                <h3 className="text-lg font-bold text-fg">{pillar.title}</h3>
                <p className="text-[15px] leading-relaxed text-muted">{pillar.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

import type { Dictionary } from "@/i18n";

export function About({ dict }: { dict: Dictionary }) {
  return (
    <section id="about" className="border-b border-border bg-surface">
      <div className="mx-auto grid max-w-7xl gap-14 px-6 py-24 sm:px-8 lg:grid-cols-2 lg:items-center lg:px-12 lg:py-32">
        <div className="flex flex-col gap-6">
          <span className="text-xs font-semibold text-accent">
            {dict.about.eyebrow}
          </span>
          <h2 className="font-display max-w-lg text-3xl leading-tight text-fg sm:text-4xl md:text-5xl">
            {dict.about.title}
          </h2>
          <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">{dict.about.description}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-3 lg:gap-6">
          {dict.about.pillars.map((pillar) => (
            <div
              key={pillar.title}
              className="flex flex-col gap-3 rounded-2xl border border-border bg-surface-2 p-6 transition-colors duration-300 hover:border-accent"
            >
              <span className="h-8 w-8 rounded-full border border-accent bg-accent-soft" aria-hidden="true" />
              <h3 className="font-display text-lg text-fg">{pillar.title}</h3>
              <p className="text-sm leading-relaxed text-muted">{pillar.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

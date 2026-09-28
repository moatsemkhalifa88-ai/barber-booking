import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n";

export function FinalCTA({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden border-b border-line/80 bg-ink">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(201,162,75,0.14),transparent_60%)]"
      />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-24 text-center sm:px-8 lg:py-32">
        <h2 className="font-display max-w-2xl text-3xl leading-tight text-cream sm:text-4xl md:text-5xl">
          {dict.finalCta.title}
        </h2>
        <p className="max-w-lg text-base leading-relaxed text-muted sm:text-lg">{dict.finalCta.subtitle}</p>
        <Button href="#booking" variant="primary">
          {dict.finalCta.cta}
        </Button>
      </div>
    </section>
  );
}

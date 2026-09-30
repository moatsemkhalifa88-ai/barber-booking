import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n";

export function FinalCTA({ dict }: { dict: Dictionary }) {
  return (
    <section className="relative overflow-hidden border-b border-border bg-surface">
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-8 px-6 py-24 text-center sm:px-8 lg:py-32">
        <h2 className="font-display max-w-2xl text-3xl leading-tight text-fg sm:text-4xl md:text-5xl">
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

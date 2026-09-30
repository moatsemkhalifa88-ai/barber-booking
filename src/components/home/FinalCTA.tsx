import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n";

export function FinalCTA({ dict }: { dict: Dictionary }) {
  return (
    <section className="section-y bg-primary text-on-primary">
      <div className="container-page flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-[1.75rem] leading-tight font-bold text-balance sm:text-4xl lg:text-5xl">
          {dict.finalCta.title}
        </h2>
        <p className="max-w-lg text-base leading-relaxed text-on-primary/85 sm:text-lg">{dict.finalCta.subtitle}</p>
        <Button href="#booking" variant="onDark" className="mt-2 w-full sm:w-auto">
          {dict.finalCta.cta}
        </Button>
      </div>
    </section>
  );
}

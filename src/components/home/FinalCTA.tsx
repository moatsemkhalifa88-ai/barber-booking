import { Button } from "@/components/ui/Button";
import type { Dictionary } from "@/i18n";

export function FinalCTA({ dict }: { dict: Dictionary }) {
  return (
    <section className="tone-dark section-y bg-cocoa text-on-ink">
      <div className="container-page flex flex-col items-center gap-4 text-center">
        <h2 className="font-display text-[44px] leading-[0.95] font-bold text-balance lg:text-[56px]">{dict.finalCta.title}</h2>
        <p className="max-w-lg text-base leading-relaxed text-on-ink-muted sm:text-lg">{dict.finalCta.subtitle}</p>
        <Button href="#booking" variant="primary" className="mt-2 w-full sm:w-auto">
          {dict.finalCta.cta}
        </Button>
      </div>
    </section>
  );
}

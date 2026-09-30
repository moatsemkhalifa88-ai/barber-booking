interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  /** Heading level; section titles are h2 unless the page has no other h1. */
  as?: "h1" | "h2";
  id?: string;
}

export function SectionHeading({ eyebrow, title, description, align = "center", as: Heading = "h2", id }: SectionHeadingProps) {
  const alignment = align === "center" ? "items-center text-center mx-auto" : "items-start text-start";

  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignment}`}>
      <span className="text-sm font-semibold text-accent">{eyebrow}</span>
      <Heading id={id} className="font-display text-[1.75rem] leading-tight font-bold text-balance text-fg sm:text-4xl lg:text-[2.5rem]">
        {title}
      </Heading>
      {description ? <p className="text-base leading-relaxed text-muted sm:text-lg">{description}</p> : null}
    </div>
  );
}

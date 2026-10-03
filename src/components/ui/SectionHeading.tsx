interface SectionHeadingProps {
  eyebrow: string;
  title: string;
  description?: string;
  align?: "start" | "center";
  /** Heading level; section titles are h2 unless the page has no other h1. */
  as?: "h1" | "h2";
  id?: string;
  /** "dark" for ink/cocoa grounds: light text and an orange eyebrow. */
  tone?: "light" | "dark";
}

export function SectionHeading({ eyebrow, title, description, align = "center", as: Heading = "h2", id, tone = "light" }: SectionHeadingProps) {
  const alignment = align === "center" ? "items-center text-center mx-auto" : "items-start text-start";

  return (
    <div className={`flex max-w-2xl flex-col gap-3 ${alignment}`}>
      <span className={`text-sm font-bold ${tone === "dark" ? "text-brand" : "text-accent"}`}>{eyebrow}</span>
      <Heading
        id={id}
        className={`font-display text-[44px] leading-[0.95] font-bold text-balance lg:text-[48px] ${tone === "dark" ? "text-on-ink" : "text-fg"}`}
      >
        {title}
      </Heading>
      {description ? (
        <p className={`text-base leading-relaxed sm:text-lg ${tone === "dark" ? "text-on-ink-muted" : "text-muted"}`}>{description}</p>
      ) : null}
    </div>
  );
}

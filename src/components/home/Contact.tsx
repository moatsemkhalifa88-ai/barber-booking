import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import type { Dictionary } from "@/i18n";

export function Contact({ dict }: { dict: Dictionary }) {
  return (
    <section id="contact" className="section-y border-b border-border bg-surface-2">
      <div className="container-page flex max-w-3xl flex-col gap-8">
        <SectionHeading
          eyebrow={dict.contact.eyebrow}
          title={dict.contact.title}
          description={dict.contact.description}
        />
        <ContactForm />
      </div>
    </section>
  );
}

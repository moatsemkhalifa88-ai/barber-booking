import { SectionHeading } from "@/components/ui/SectionHeading";
import { ContactForm } from "@/components/contact/ContactForm";
import type { Dictionary } from "@/i18n";

export function Contact({ dict }: { dict: Dictionary }) {
  return (
    <section id="contact" className="border-b border-border bg-surface">
      <div className="mx-auto flex max-w-3xl flex-col gap-12 px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
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

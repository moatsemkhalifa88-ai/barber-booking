import type { ReactNode } from "react";
import { Bidi } from "@/components/ui/Bidi";
import { ClockIcon, MailIcon } from "@/components/ui/Icons";
import type { Dictionary } from "@/i18n";

/** Same address as the footer's contact link. */
const CONTACT_EMAIL = "moatsem.khalifa88@gmail.com";

function InfoRow({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <li className="flex items-center gap-4 border-b border-on-ink/15 py-4 first:border-t">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink/40 text-brand">{icon}</span>
      <div className="flex min-w-0 flex-col">
        <span className="text-sm text-on-ink-muted">{label}</span>
        {children}
      </div>
    </li>
  );
}

/** Chocolate band: short story plus practical info (hours, email). No address or phone — the shop is fictional. */
export function About({ dict }: { dict: Dictionary }) {
  const t = dict.about;

  return (
    <section id="about" className="tone-dark section-y bg-cocoa text-on-ink">
      <div className="container-page grid gap-8 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div className="flex flex-col gap-3">
          <span className="text-sm font-bold text-brand">{t.eyebrow}</span>
          <h2 className="font-display text-[44px] leading-[0.95] font-bold text-balance lg:text-[48px]">{t.title}</h2>
          <p className="max-w-lg text-base leading-relaxed text-on-ink-muted sm:text-lg">{t.description}</p>
        </div>

        <ul className="flex flex-col">
          <InfoRow icon={<ClockIcon className="h-5 w-5" />} label={t.hoursLabel}>
            <span className="text-base font-semibold">
              <bdi>{t.openDaysValue}</bdi> · <Bidi>{dict.workingHours.hoursLabel}</Bidi>
            </span>
            <span className="text-base text-on-ink-muted">
              <bdi>{t.closedDaysValue}</bdi>
            </span>
          </InfoRow>
          <InfoRow icon={<MailIcon className="h-5 w-5" />} label={t.emailLabel}>
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="inline-flex min-h-11 items-center self-start text-base font-semibold break-all text-on-ink underline-offset-4 hover:underline"
            >
              <bdi>{CONTACT_EMAIL}</bdi>
            </a>
          </InfoRow>
        </ul>
      </div>
    </section>
  );
}

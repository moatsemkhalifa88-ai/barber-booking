import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTopButton, MobileActionBar } from "@/components/layout/MobileActionBar";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { BackIcon } from "@/components/ui/Icons";
import { ManageBookingForm } from "@/components/booking/ManageBookingForm";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: dict.meta.manageBookingTitle,
    description: dict.meta.manageBookingDescription,
  };
}

export default async function ManageBookingPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const { ref } = await searchParams;
  // Pre-filled from the confirmation screen's "View or cancel" link.
  const initialReference = typeof ref === "string" && /^MOA-[A-Z0-9]{8}$/i.test(ref) ? ref.toUpperCase() : "";

  return (
    <>
      <Header />
      <main className="flex-1">
        <section id="manage" className="border-b border-border bg-surface-2">
          <div className="container-page section-y flex max-w-xl flex-col gap-6">
            <Link href="/" className="inline-flex min-h-11 items-center gap-1.5 self-start text-base font-semibold text-accent">
              <BackIcon className="h-4 w-4" />
              {dict.manageBooking.backToHome}
            </Link>
            <SectionHeading
              as="h1"
              align="start"
              eyebrow={dict.manageBooking.eyebrow}
              title={dict.manageBooking.title}
              description={dict.manageBooking.description}
            />
            <ManageBookingForm initialReference={initialReference} />
          </div>
        </section>
      </main>
      <Footer dict={dict} />
      <MobileActionBar page="manage" />
      <BackToTopButton />
    </>
  );
}

import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Button } from "@/components/ui/Button";
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

export default async function ManageBookingPage() {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <>
      <Header />
      <main className="flex-1">
        <section className="border-b border-line/80 bg-charcoal">
          <div className="mx-auto flex max-w-7xl flex-col gap-14 px-6 py-24 sm:px-8 lg:px-12 lg:py-32">
            <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
              <SectionHeading
                align="left"
                eyebrow={dict.manageBooking.eyebrow}
                title={dict.manageBooking.title}
                description={dict.manageBooking.description}
              />
              <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
                <Button href="/" variant="secondary" className="whitespace-nowrap">
                  {dict.manageBooking.backToHome}
                </Button>
                <Button href="/#booking" variant="ghost" className="whitespace-nowrap">
                  {dict.manageBooking.bookAnotherAppointmentCta}
                </Button>
              </div>
            </div>
            <ManageBookingForm />
          </div>
        </section>
      </main>
      <Footer dict={dict} />
    </>
  );
}

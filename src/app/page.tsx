import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { BackToTopButton, MobileActionBar } from "@/components/layout/MobileActionBar";
import { ScrollReveal } from "@/components/ui/ScrollReveal";
import { Hero } from "@/components/home/Hero";
import { About } from "@/components/home/About";
import { Services } from "@/components/home/Services";
import { Barbers } from "@/components/home/Barbers";
import { BookingWidget } from "@/components/booking/BookingWidget";
import { WorkingHours } from "@/components/home/WorkingHours";
import { GalleryPreview } from "@/components/home/GalleryPreview";
import { Contact } from "@/components/home/Contact";
import { FinalCTA } from "@/components/home/FinalCTA";
import { getActiveServices } from "@/lib/booking/catalog";
import { FALLBACK_SERVICES } from "@/lib/booking/fallback-data";
import { isSupabaseConfigured } from "@/lib/env";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n";

export default async function Home() {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  const dbServices = await getActiveServices();
  // The interactive booking flow should always be visible: fall back to the
  // static service menu for display whenever real service data isn't
  // available — not only when env vars are missing, but also if the query
  // itself fails (e.g. a pending migration). "Configured" means "can
  // actually complete a real booking right now," which requires both valid
  // credentials AND real service rows; either gap disables the final submit
  // and shows the dev-only notice, rather than silently rendering an empty
  // service picker.
  const isBookingConfigured = isSupabaseConfigured() && dbServices.length > 0;
  const services = isBookingConfigured ? dbServices : FALLBACK_SERVICES;

  return (
    <>
      <Header />
      <main className="flex-1">
        <Hero dict={dict} />
        <About dict={dict} />
        <Services dict={dict} locale={locale} />
        <Barbers dict={dict} />
        <GalleryPreview dict={dict} />
        <BookingWidget services={services} isBookingConfigured={isBookingConfigured} />
        <WorkingHours dict={dict} />
        <Contact dict={dict} />
        <FinalCTA dict={dict} />
      </main>
      <Footer dict={dict} />
      <MobileActionBar page="home" />
      <BackToTopButton />
      <ScrollReveal />
    </>
  );
}

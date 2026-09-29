import type { Metadata } from "next";
import { Geist, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary, dirForLocale } from "@/i18n";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { cookies } from "next/headers";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { DEMO_BANNER_COOKIE } from "@/lib/demo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const dict = getDictionary(locale);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const isDemoBannerDismissed = (await cookies()).get(DEMO_BANNER_COOKIE)?.value === "1";

  return (
    <html
      lang={locale}
      dir={dirForLocale(locale)}
      className={`${geistSans.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-ink font-sans text-cream">
        <LocaleProvider initialLocale={locale}>
          {isDemoBannerDismissed ? null : <DemoBanner />}
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}

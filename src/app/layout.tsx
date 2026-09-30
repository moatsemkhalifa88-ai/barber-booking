import type { Metadata, Viewport } from "next";
import { Assistant, Frank_Ruhl_Libre } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary, dirForLocale } from "@/i18n";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { cookies } from "next/headers";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { DEMO_BANNER_COOKIE } from "@/lib/demo";

const assistant = Assistant({
  variable: "--font-assistant",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const frankRuhlLibre = Frank_Ruhl_Libre({
  variable: "--font-frank-ruhl",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#faf7f2",
};

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
      className={`${assistant.variable} ${frankRuhlLibre.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-canvas font-sans text-fg">
        <LocaleProvider initialLocale={locale}>
          {isDemoBannerDismissed ? null : <DemoBanner />}
          {children}
        </LocaleProvider>
      </body>
    </html>
  );
}

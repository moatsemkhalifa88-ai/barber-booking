import type { Metadata, Viewport } from "next";
import { Bebas_Neue, Heebo, Karantina } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary, dirForLocale } from "@/i18n";
import { LocaleProvider } from "@/i18n/LocaleProvider";
import { cookies } from "next/headers";
import { DemoBanner } from "@/components/layout/DemoBanner";
import { DEMO_BANNER_COOKIE } from "@/lib/demo";

// Body: Heebo. Headings: Karantina (condensed Hebrew) with Bebas Neue for English
// (the active one is picked per language in globals.css via --font-display-face).
const heebo = Heebo({
  variable: "--font-heebo",
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const karantina = Karantina({
  variable: "--font-karantina",
  weight: ["400", "700"],
  subsets: ["hebrew", "latin"],
  display: "swap",
});

const bebasNeue = Bebas_Neue({
  variable: "--font-bebas",
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#1b1714",
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
      className={`${heebo.variable} ${karantina.variable} ${bebasNeue.variable} h-full antialiased`}
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

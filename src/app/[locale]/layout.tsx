import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AnalyticsProvider } from "@/features/analytics/components/AnalyticsProvider";
import { ResourceHints, CriticalCSS } from "@/features/performance/components/WebVitalsTracker";
import { headers } from 'next/headers';

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-playfair",
});

export async function generateMetadata({
  params
}: {
  params: Promise<{ locale: string }>
}): Promise<Metadata> {
  const { locale } = await params;
  return {
    title: {
      default: "ProsektorWeb | 11 Yıllık İş Güvenliği Uzmanlığı",
      template: "%s | ProsektorWeb"
    },
    description: "ProsektorWeb, 11 yıllık iş güvenliği deneyimi ile OSGB sektörünün lider web sitesi çözümleri. İş güvenliği uzmanı kadrosu, mevzuat uyumu ve dijital dönüşüm.",
    keywords: ["iş güvenliği", "osgb", "iş sağlığı", "6331 sayılı kanun", "iş güvenliği uzmanı", "işyeri hekimi", "risk analizi", "osgb web sitesi"],
    authors: [{ name: "ProsektorWeb" }],
    creator: "ProsektorWeb",
    openGraph: {
      type: "website",
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      url: "https://prosektorweb.com",
      siteName: "ProsektorWeb",
      title: "ProsektorWeb | 11 Yıllık İş Güvenliği Uzmanlığı",
      description: "11 yıllık iş güvenliği deneyimi ile OSGB sektörünün lider web sitesi çözümleri.",
    },
    twitter: {
      card: "summary_large_image",
      title: "ProsektorWeb | 11 Yıllık İş Güvenliği Uzmanlığı",
      description: "11 yıllık iş güvenliği deneyimi ile OSGB sektörü için profesyonel web sitesi çözümleri.",
    },
    robots: {
      index: true,
      follow: true,
    },
    icons: {
      icon: '/favicon.ico',
      shortcut: '/favicon.ico',
      apple: '/favicon.ico',
    },
    verification: {
      google: 'IpXYWdgtYmLHngJAYrqcS2GYhdD11UuGxzecA8UNVuo',
    },
  };
}

import { ThemeProvider } from "@/shared/components/providers/ThemeProvider";
import { GlobalSeoSchemas } from "@/features/seo/components/GlobalSeoSchemas";

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();
  const nonce = (await headers()).get('x-nonce') || undefined;

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <ResourceHints />
        <CriticalCSS nonce={nonce} />
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 bg-brand-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
          Skip to content
        </a>
        <GlobalSeoSchemas />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <AnalyticsProvider nonce={nonce}>
              <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
              >
                {children}
              </ThemeProvider>
            </AnalyticsProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

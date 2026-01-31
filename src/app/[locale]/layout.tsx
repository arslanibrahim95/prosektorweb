import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { AnalyticsProvider } from "@/features/analytics/components/AnalyticsProvider";
import { ResourceHints, CriticalCSS } from "@/features/performance/components/WebVitalsTracker";

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
      default: "ProSektorWeb | OSGB Web Sitesi",
      template: "%s | ProSektorWeb"
    },
    description: "OSGB'niz için profesyonel web sitesi. 7 gün ücretsiz önizleme, tek fiyat ve tam sektör uyumu.",
    keywords: ["isg", "iş güvenliği", "iş sağlığı", "osgb", "risk analizi", "mevzuat", "6331"],
    authors: [{ name: "ProSektorWeb" }],
    creator: "ProSektorWeb",
    openGraph: {
      type: "website",
      locale: locale === 'tr' ? 'tr_TR' : 'en_US',
      url: "https://prosektorweb.com",
      siteName: "ProSektorWeb",
      title: "ProSektorWeb | OSGB Web Sitesi",
      description: "OSGB'niz için profesyonel web sitesi",
    },
    twitter: {
      card: "summary_large_image",
      title: "ProSektorWeb | OSGB Web Sitesi",
      description: "OSGB'niz için profesyonel web sitesi. 7 gün ücretsiz önizleme, tek fiyat ve tam sektör uyumu.",
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

import { ThemeProvider } from "@/components/ui/ThemeProvider";
import { JsonLd } from "@/features/seo/components/JsonLd";

export default async function RootLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  const messages = await getMessages();

  return (
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`} suppressHydrationWarning>
      <head>
        <ResourceHints />
        <CriticalCSS />
      </head>
      <body className="font-sans antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-4 focus:left-4 bg-brand-600 text-white px-4 py-2 rounded-lg font-bold shadow-lg">
          Skip to content
        </a>
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "ProSektorWeb",
          "url": "https://prosektorweb.com",
          "logo": "https://prosektorweb.com/logo.png",
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+90-555-123-4567",
            "contactType": "customer service"
          }
        }} />
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            <AnalyticsProvider>
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

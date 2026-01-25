import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/features/auth/components/AuthProvider";
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';

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

import { ThemeProvider } from "@/components/ThemeProvider";
import { JsonLd } from "@/components/seo/JsonLd";

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
      <body className="font-sans antialiased">
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
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

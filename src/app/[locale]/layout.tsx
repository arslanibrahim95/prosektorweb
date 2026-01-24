import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "../globals.css";
import { AuthProvider } from "@/components/AuthProvider";
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
  };
}

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
    <html lang={locale} className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <NextIntlClientProvider messages={messages}>
          <AuthProvider>
            {children}
          </AuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}

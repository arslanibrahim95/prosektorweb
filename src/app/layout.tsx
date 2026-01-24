import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";

export const metadata: Metadata = {
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
    locale: "tr_TR",
    url: "https://prosektorweb.com",
    siteName: "ProSektorWeb",
    title: "ProSektorWeb | OSGB Web Sitesi",
    description: "OSGB'niz için profesyonel web sitesi",
  },
  twitter: {
    card: "summary_large_image",
    title: "ProSektorWeb",
    description: "Türkiye'nin en kapsamlı İSG blog platformu",
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}

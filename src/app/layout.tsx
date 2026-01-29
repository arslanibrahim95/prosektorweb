import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/features/auth/components/AuthProvider";

export const metadata: Metadata = {
  title: {
    default: "ProSektorWeb | İş Sağlığı ve Güvenliği Blog",
    template: "%s | ProSektorWeb"
  },
  description: "Türkiye'nin en kapsamlı İSG blog platformu. 400'den fazla makale, güncel mevzuat bilgileri, risk yönetimi ve dijital dönüşüm rehberleri.",
  keywords: ["isg", "iş güvenliği", "iş sağlığı", "osgb", "risk analizi", "mevzuat", "6331"],
  authors: [{ name: "ProSektorWeb" }],
  creator: "ProSektorWeb",
  openGraph: {
    type: "website",
    locale: "tr_TR",
    url: "https://prosektorweb.com",
    siteName: "ProSektorWeb",
    title: "ProSektorWeb | İş Sağlığı ve Güvenliği Blog",
    description: "Türkiye'nin en kapsamlı İSG blog platformu",
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

import { validateEnv } from "@/shared/lib";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Fail-fast boot-time validation
  validateEnv();

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

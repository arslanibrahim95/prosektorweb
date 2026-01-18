import type { Metadata } from "next";
import "./globals.css";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body className="font-sans antialiased">
        {children}
      </body>
    </html>
  );
}

import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocalSeoPage } from "@/components/seo/LocalSeoPage";
import { WebVitalsTracker } from "@/features/performance/components/WebVitalsTracker";
import {
  getAllProvinces,
  getAllServices,
  getProvinceBySlug,
  getServiceBySlug,
  getIndustrialProvinces,
  generateLocalPage,
} from "@/features/ai-generation/lib/pipeline/seo";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ cityService: string; locale?: string }>;
};

/** Parse "istanbul-isyeri-hekimi" into province + service */
function parseCityServiceSlug(slug: string) {
  const provinces = getAllProvinces();
  const services = getAllServices();

  // Try each province slug as prefix: longest match first
  const sortedProvinces = [...provinces].sort(
    (a, b) => b.slug.length - a.slug.length
  );

  for (const province of sortedProvinces) {
    if (slug.startsWith(`${province.slug}-`)) {
      const serviceSlug = slug.slice(province.slug.length + 1);
      const service = getServiceBySlug(serviceSlug);
      if (service) {
        return { province, service };
      }
    }
  }

  return null;
}

// Known static route segments that should NOT be caught by this dynamic route
const RESERVED_SEGMENTS = new Set([
  "admin",
  "blog",
  "portal",
  "login",
  "forgot-password",
  "reset-password",
  "proposal",
  "cerez-politikasi",
  "gizlilik-ve-kvkk",
  "mesafeli-satis-sozlesmesi",
  "demo",
]);

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cityService, locale = "tr" } = await params;

  if (RESERVED_SEGMENTS.has(cityService)) return {};

  const parsed = parseCityServiceSlug(cityService);
  if (!parsed) return { title: "Sayfa Bulunamadi" };

  const page = generateLocalPage(parsed.service, parsed.province);

  const canonicalUrl = locale === "tr"
    ? page.canonicalUrl
    : page.canonicalUrl.replace("https://prosektorweb.com", `https://prosektorweb.com/${locale}`);

  return {
    title: page.title,
    description: page.metaDescription,
    keywords: page.keywords,
    openGraph: {
      title: page.title,
      description: page.metaDescription,
      type: "website",
      locale: locale === "tr" ? "tr_TR" : "en_US",
    },
    alternates: {
      canonical: canonicalUrl,
      languages: {
        "tr": page.canonicalUrl,
        "en": page.canonicalUrl.replace("https://prosektorweb.com", "https://prosektorweb.com/en"),
      },
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

// ISR: Sadece sanayi yogun illeri static uret, gerisi on-demand
export async function generateStaticParams() {
  // Oncelikli 10 il - sanayi yogun
  const priorityProvinces = getIndustrialProvinces();
  const services = getAllServices();
  const params: { cityService: string; locale: string }[] = [];

  for (const province of priorityProvinces) {
    for (const service of services) {
      params.push({ cityService: `${province.slug}-${service.slug}`, locale: "tr" });
      params.push({ cityService: `${province.slug}-${service.slug}`, locale: "en" });
    }
  }

  return params;
}

// ISR revalidation - 24 saatte bir yenile
export const revalidate = 86400;

export default async function CityServicePage({ params }: Props) {
  const { cityService, locale = "tr" } = await params;

  if (RESERVED_SEGMENTS.has(cityService)) {
    notFound();
  }

  const parsed = parseCityServiceSlug(cityService);
  if (!parsed) {
    notFound();
  }

  const baseUrl = locale === "tr"
    ? "https://prosektorweb.com"
    : `https://prosektorweb.com/${locale}`;

  const page = generateLocalPage(parsed.service, parsed.province, undefined, {
    baseUrl,
  });

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-brand-100 selection:text-brand-900">
      <Navbar variant="inner" />
      <LocalSeoPage page={page} />
      <Footer variant="inner" />
      <WebVitalsTracker
        pageType="province-service"
        city={parsed.province.name}
        service={parsed.service.name}
      />
    </div>
  );
}

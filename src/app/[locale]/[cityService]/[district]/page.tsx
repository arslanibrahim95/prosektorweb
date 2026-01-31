import { notFound } from "next/navigation";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { LocalSeoPage } from "@/features/seo/components/LocalSeoPage";
import { WebVitalsTracker } from "@/features/performance/components/WebVitalsTracker";
import {
  getAllProvinces,
  getAllServices,
  getServiceBySlug,
  getIndustrialProvinces,
  generateLocalPage,
} from "@/features/ai-generation/lib/pipeline/seo";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ cityService: string; district: string; locale?: string }>;
};

function parseCityServiceSlug(slug: string) {
  const provinces = getAllProvinces();
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

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { cityService, district: districtSlug, locale = "tr" } = await params;

  const parsed = parseCityServiceSlug(cityService);
  if (!parsed) return { title: "Sayfa Bulunamadi" };

  const district = parsed.province.districts.find(
    (d) => d.slug === districtSlug
  );
  if (!district) return { title: "Sayfa Bulunamadi" };

  const page = generateLocalPage(parsed.service, parsed.province, district);

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

// ISR: Sadece oncelikli illerin ilcelerini static uret
export async function generateStaticParams() {
  const priorityProvinces = getIndustrialProvinces();
  const services = getAllServices();
  const params: { cityService: string; district: string; locale: string }[] = [];

  for (const province of priorityProvinces) {
    for (const service of services) {
      // Sadece merkez ilceleri static uret (ilk 3 ilce)
      const centerDistricts = province.districts.slice(0, 3);
      for (const district of centerDistricts) {
        params.push({
          cityService: `${province.slug}-${service.slug}`,
          district: district.slug,
          locale: "tr",
        });
        params.push({
          cityService: `${province.slug}-${service.slug}`,
          district: district.slug,
          locale: "en",
        });
      }
    }
  }

  return params;
}

// ISR revalidation - 7 gunde bir yenile (ilce sayfalari daha az degisir)
export const revalidate = 604800;

export default async function DistrictPage({ params }: Props) {
  const { cityService, district: districtSlug, locale = "tr" } = await params;

  const parsed = parseCityServiceSlug(cityService);
  if (!parsed) {
    notFound();
  }

  const district = parsed.province.districts.find(
    (d) => d.slug === districtSlug
  );
  if (!district) {
    notFound();
  }

  const baseUrl = locale === "tr"
    ? "https://prosektorweb.com"
    : `https://prosektorweb.com/${locale}`;

  const page = generateLocalPage(parsed.service, parsed.province, district, {
    baseUrl,
  });

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 font-sans selection:bg-brand-100 selection:text-brand-900">
      <Navbar variant="inner" />
      <LocalSeoPage page={page} />
      <Footer variant="inner" />
      <WebVitalsTracker
        pageType="district-service"
        city={parsed.province.name}
        service={parsed.service.name}
      />
    </div>
  );
}

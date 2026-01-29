import Link from "next/link";
import { Phone, FileText, ChevronRight, Shield, CheckCircle, MapPin } from "lucide-react";
import { JsonLd } from "@/components/seo/JsonLd";
import type { LocalPage, ContentSection } from '@/features/ai-generation/lib/pipeline/seo';

interface LocalSeoPageProps {
  page: LocalPage;
}

function BreadcrumbNav({ items }: { items: LocalPage["breadcrumbs"] }) {
  return (
    <nav aria-label="Breadcrumb" className="mb-8">
      <ol className="flex flex-wrap items-center gap-1 text-sm text-neutral-500">
        {items.map((item, i) => (
          <li key={item.url} className="flex items-center gap-1">
            {i > 0 && <ChevronRight className="w-3 h-3" />}
            {i < items.length - 1 ? (
              <Link href={item.url} className="hover:text-brand-600 transition">
                {item.name}
              </Link>
            ) : (
              <span className="text-neutral-900 font-medium">{item.name}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function HeroSection({ section }: { section: ContentSection }) {
  const data = section.data as Record<string, unknown> | undefined;

  return (
    <section className="pt-24 pb-16 bg-gradient-to-b from-brand-50 to-white">
      <div className="max-w-4xl mx-auto px-6 pt-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white border border-brand-200 shadow-sm text-brand-600 rounded-full text-sm font-bold mb-6">
          <Shield className="w-4 h-4" />
          6331 Sayili Kanun
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black font-serif leading-tight mb-6 text-neutral-900 tracking-tight">
          {section.heading}
        </h1>
        <p className="text-lg md:text-xl text-neutral-600 leading-relaxed max-w-3xl mb-10">
          {section.content}
        </p>
        <div className="flex flex-wrap gap-4">
          {data?.ctaPhone ? (
            <a
              href="tel:+905551234567"
              className="inline-flex items-center gap-2 px-8 py-4 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-600/25"
            >
              <Phone className="w-5 h-5" />
              {String(data.ctaText || "Hemen Arayin")}
            </a>
          ) : null}
          <a
            href="#iletisim"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 border-2 border-brand-200 rounded-xl font-bold hover:border-brand-400 transition"
          >
            <FileText className="w-5 h-5" />
            Teklif Alin
          </a>
        </div>
      </div>
    </section>
  );
}

function TextSection({ section }: { section: ContentSection }) {
  return (
    <section className="py-12">
      <div className="max-w-3xl mx-auto px-6">
        {section.heading && (
          <h2 className="text-3xl font-black font-serif text-neutral-900 tracking-tight mb-6">
            {section.heading}
          </h2>
        )}
        <div
          className="prose prose-lg max-w-none prose-neutral
            prose-headings:font-black prose-headings:font-serif prose-headings:text-neutral-900 prose-headings:tracking-tight
            prose-h3:text-2xl prose-h3:mt-8 prose-h3:mb-4
            prose-p:text-neutral-600 prose-p:leading-8
            prose-strong:text-neutral-900 prose-strong:font-bold
            prose-li:text-neutral-600
            prose-blockquote:border-brand-400 prose-blockquote:bg-brand-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1 prose-blockquote:px-4
          "
          dangerouslySetInnerHTML={{ __html: markdownToHtml(section.content) }}
        />
      </div>
    </section>
  );
}

function FaqSection({ section }: { section: ContentSection }) {
  const data = section.data as { faqs?: { question: string; answer: string }[] } | undefined;
  const faqs = data?.faqs || [];

  if (faqs.length === 0) return null;

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };

  return (
    <section className="py-12 bg-neutral-50">
      <div className="max-w-3xl mx-auto px-6">
        <JsonLd data={faqSchema} />
        <h2 className="text-3xl font-black font-serif text-neutral-900 tracking-tight mb-8">
          {section.heading || "Sikca Sorulan Sorular"}
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group bg-white rounded-xl border border-neutral-200 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer font-bold text-neutral-900 hover:text-brand-600 transition">
                {faq.question}
                <ChevronRight className="w-5 h-5 text-neutral-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-6 pb-6 text-neutral-600 leading-relaxed">
                {faq.answer}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection({ section }: { section: ContentSection }) {
  return (
    <section id="iletisim" className="py-16 bg-brand-600">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <h2 className="text-3xl md:text-4xl font-black font-serif text-white tracking-tight mb-4">
          {section.heading}
        </h2>
        <p className="text-lg text-brand-100 mb-8">{section.content}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href="tel:+905551234567"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-brand-600 rounded-xl font-bold hover:bg-brand-50 transition shadow-lg"
          >
            <Phone className="w-5 h-5" />
            Hemen Arayin
          </a>
          <a
            href="#teklif-formu"
            className="inline-flex items-center gap-2 px-8 py-4 bg-brand-700 text-white rounded-xl font-bold hover:bg-brand-800 transition border border-brand-500"
          >
            <FileText className="w-5 h-5" />
            Teklif Formu
          </a>
        </div>
      </div>
    </section>
  );
}

function NeighborGrid({
  neighborLinks,
  serviceName,
  provinceName,
}: {
  neighborLinks: LocalPage["neighborLinks"];
  serviceName: string;
  provinceName: string;
}) {
  if (neighborLinks.length === 0) return null;

  return (
    <section className="py-12 bg-white">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-black font-serif text-neutral-900 tracking-tight mb-3">
            Komsu Illerde {serviceName}
          </h2>
          <p className="text-neutral-500 max-w-2xl mx-auto">
            {provinceName} merkezli ekibimiz asagidaki komsu illere de hizmet vermektedir.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {neighborLinks.map((neighbor) => (
            <Link
              key={neighbor.url}
              href={neighbor.url}
              className="group p-5 bg-neutral-50 rounded-xl border border-neutral-200 hover:border-brand-300 hover:shadow-lg hover:bg-white transition-all"
            >
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 group-hover:bg-brand-200 transition">
                  <MapPin className="w-5 h-5 text-brand-600" />
                </div>
                <div>
                  <div className="font-bold text-neutral-900 group-hover:text-brand-600 transition">
                    {neighbor.name}
                  </div>
                  <div className="text-sm text-neutral-500 mt-0.5">
                    {serviceName} · {neighbor.districtCount} ilce
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function RelatedLinks({ pages, currentService }: { pages: string[]; currentService: string }) {
  if (pages.length === 0) return null;

  return (
    <section className="py-12">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="text-2xl font-black font-serif text-neutral-900 tracking-tight mb-6">
          Diger Hizmet Bolgeleri
        </h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
          {pages
            .filter((url) => !url.includes("undefined"))
            .slice(0, 9)
            .map((url) => (
            <Link
              key={url}
              href={url}
              className="flex items-center gap-2 p-4 bg-white rounded-xl border border-neutral-200 hover:border-brand-200 hover:shadow-md transition group"
            >
              <CheckCircle className="w-4 h-4 text-brand-500 shrink-0" />
              <span className="text-sm font-medium text-neutral-700 group-hover:text-brand-600 transition">
                {formatUrlToLabel(url, currentService)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function SectionRenderer({ section }: { section: ContentSection }) {
  switch (section.type) {
    case "hero":
      return <HeroSection section={section} />;
    case "text":
    case "features":
    case "stats":
    case "testimonial":
      return <TextSection section={section} />;
    case "faq":
      return <FaqSection section={section} />;
    case "cta":
      return <CtaSection section={section} />;
    default:
      return <TextSection section={section} />;
  }
}

export function LocalSeoPage({ page }: LocalSeoPageProps) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: page.breadcrumbs.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <>
      <JsonLd data={page.schema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="max-w-4xl mx-auto px-6 pt-28">
        <BreadcrumbNav items={page.breadcrumbs} />
      </div>

      {page.sections.map((section) => (
        <SectionRenderer key={section.id} section={section} />
      ))}

      <NeighborGrid
        neighborLinks={page.neighborLinks}
        serviceName={page.service.name}
        provinceName={page.province.name}
      />

      <RelatedLinks pages={page.relatedPages} currentService={page.service.name} />
    </>
  );
}

// --- Helpers ---

function markdownToHtml(markdown: string): string {
  return markdown
    .replace(/### (.+)/g, "<h3>$1</h3>")
    .replace(/#### (.+)/g, "<h4>$1</h4>")
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
    .replace(/^- (.+)/gm, "<li>$1</li>")
    .replace(/(<li>.*<\/li>\n?)+/g, (match) => `<ul>${match}</ul>`)
    .replace(/^> (.+)/gm, "<blockquote><p>$1</p></blockquote>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/^(?!<[hluob])(.+)$/gm, (match) =>
      match.trim() ? `<p>${match}</p>` : ""
    );
}

function formatUrlToLabel(url: string, serviceName: string): string {
  const parts = url.replace(/^\/|\/$/g, "").split("/");
  if (parts.length === 2) {
    return parts[1].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return parts[0].replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Structured Data (Schema.org) Expansion
 * 
 * FAQPage, HowTo, Service types
 * Dynamic generation based on page content
 * Breadcrumb integration
 */

import type { LocalPage, ContentSection } from '@/features/ai-generation/lib/pipeline/seo';

// Schema.org types
interface SchemaBase {
    '@context': 'https://schema.org';
    '@type': string;
}

interface FAQPageSchema extends SchemaBase {
    '@type': 'FAQPage';
    mainEntity: Array<{
        '@type': 'Question';
        name: string;
        acceptedAnswer: {
            '@type': 'Answer';
            text: string;
        };
    }>;
}

interface HowToSchema extends SchemaBase {
    '@type': 'HowTo';
    name: string;
    description: string;
    step: Array<{
        '@type': 'HowToStep';
        name: string;
        text: string;
        url?: string;
    }>;
}

interface ServiceSchema extends SchemaBase {
    '@type': 'Service';
    name: string;
    description: string;
    provider: {
        '@type': 'Organization';
        name: string;
        url: string;
    };
    areaServed: {
        '@type': 'City' | 'AdministrativeArea';
        name: string;
    };
    serviceType: string;
}

interface BreadcrumbSchema extends SchemaBase {
    '@type': 'BreadcrumbList';
    itemListElement: Array<{
        '@type': 'ListItem';
        position: number;
        name: string;
        item: string;
    }>;
}

/**
 * FAQPage schema oluştur
 */
export function generateFAQSchema(page: LocalPage): FAQPageSchema | null {
    const faqSection = page.sections.find((s) => s.id === 'sss');
    if (!faqSection?.data?.faqs || !Array.isArray(faqSection.data.faqs)) {
        return null;
    }

    const faqs = faqSection.data.faqs as Array<{ question: string; answer: string }>;

    if (faqs.length === 0) return null;

    return {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((faq) => ({
            '@type': 'Question',
            name: faq.question,
            acceptedAnswer: {
                '@type': 'Answer',
                text: faq.answer,
            },
        })),
    };
}

/**
 * HowTo schema oluştur (hizmet süreçleri için)
 */
export function generateHowToSchema(
    page: LocalPage,
    steps: Array<{ name: string; text: string }>
): HowToSchema {
    return {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: `${page.service.name} Nasıl Yapılır?`,
        description: `${page.province.name} bölgesinde ${page.service.name} hizmeti süreci`,
        step: steps.map((step, index) => ({
            '@type': 'HowToStep',
            name: step.name,
            text: step.text,
            url: `${page.canonicalUrl}#adim-${index + 1}`,
        })),
    };
}

/**
 * Service schema oluştur
 */
export function generateServiceSchema(page: LocalPage): ServiceSchema {
    return {
        '@context': 'https://schema.org',
        '@type': 'Service',
        name: page.service.name,
        description: page.metaDescription,
        provider: {
            '@type': 'Organization',
            name: page.schema.name || 'ProSektor OSGB',
            url: 'https://prosektorweb.com',
        },
        areaServed: {
            '@type': page.district ? 'City' : 'AdministrativeArea',
            name: page.district
                ? `${page.district.name}, ${page.province.name}`
                : page.province.name,
        },
        serviceType: page.service.name,
    };
}

/**
 * Breadcrumb schema oluştur
 */
export function generateBreadcrumbSchema(page: LocalPage): BreadcrumbSchema {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: page.breadcrumbs.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: `https://prosektorweb.com${item.url}`,
        })),
    };
}

/**
 * Tüm schema'ları birleştir
 */
export function generateAllSchemas(page: LocalPage): unknown[] {
    const schemas: unknown[] = [];

    // LocalBusiness schema (ana schema)
    schemas.push(page.schema);

    // Breadcrumb
    schemas.push(generateBreadcrumbSchema(page));

    // FAQPage
    const faqSchema = generateFAQSchema(page);
    if (faqSchema) {
        schemas.push(faqSchema);
    }

    // Service
    schemas.push(generateServiceSchema(page));

    // HowTo (hizmete özel adımlar)
    const howToSteps = generateHowToSteps(page);
    if (howToSteps.length > 0) {
        schemas.push(generateHowToSchema(page, howToSteps));
    }

    return schemas;
}

/**
 * Hizmete özel HowTo adımları oluştur
 */
function generateHowToSteps(
    page: LocalPage
): Array<{ name: string; text: string }> {
    const serviceId = page.service.id;

    const stepsMap: Record<string, Array<{ name: string; text: string }>> = {
        'isyeri-hekimi': [
            { name: 'İletişim', text: 'Bize telefon veya form aracılığıyla ulaşın' },
            { name: 'Keşif', text: 'İşyerinizde ücretsiz keşif yapılır' },
            { name: 'Tehlike Sınıfı Belirleme', text: 'NACE koduna göre tehlike sınıfı belirlenir' },
            { name: 'Sözleşme', text: 'Hizmet sözleşmesi imzalanır' },
            { name: 'Hizmet Başlangıcı', text: 'İşyeri hekimi ataması yapılır' },
        ],
        'is-guvenligi-uzmani': [
            { name: 'İletişim', text: 'Bize ulaşın ve ihtiyacınızı bildirin' },
            { name: 'Tehlike Analizi', text: 'İşyerinizin tehlike sınıfı belirlenir' },
            { name: 'Uzman Seçimi', text: 'A, B veya C sınıfı uzman atanır' },
            { name: 'Sözleşme', text: 'OSGB sözleşmesi imzalanır' },
            { name: 'Hizmet Başlangıcı', text: 'Periyodik kontroller başlar' },
        ],
        'risk-analizi': [
            { name: 'Başvuru', text: 'Risk analizi talebinizi iletin' },
            { name: 'İşyeri Gezisi', text: 'Tehlikeler yerinde tespit edilir' },
            { name: 'Risk Değerlendirmesi', text: 'Risk matrisi oluşturulur' },
            { name: 'Rapor Hazırlama', text: 'Detaylı risk analizi raporu hazırlanır' },
            { name: 'Sunum ve Eğitim', text: 'Rapor sunumu ve çalışan eğitimi' },
        ],
        'isg-egitimi': [
            { name: 'Eğitim Planlaması', text: 'Grup sayısı ve tarih belirlenir' },
            { name: 'Tehlike Sınıfı Analizi', text: 'Eğitim içeriği belirlenir' },
            { name: 'Eğitim Verilmesi', text: 'Uzman eğitmenler tarafından eğitim' },
            { name: 'Sınav', text: 'Değerlendirme sınavı yapılır' },
            { name: 'Sertifika', text: 'Katılım sertifikaları verilir' },
        ],
    };

    return stepsMap[serviceId] || [];
}

/**
 * Schema.org JSON-LD script tag'i oluştur
 */
export function generateSchemaScript(schemas: unknown[]): string {
    return schemas
        .map((schema) => `<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
        .join('\n');
}

/**
 * Google Rich Results Test için schema validasyonu
 */
export function validateSchema(schema: unknown): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!schema || typeof schema !== 'object') {
        errors.push('Schema must be an object');
        return { valid: false, errors };
    }

    const s = schema as Record<string, unknown>;

    // @context kontrolü
    if (s['@context'] !== 'https://schema.org') {
        errors.push('Missing or invalid @context');
    }

    // @type kontrolü
    if (!s['@type'] || typeof s['@type'] !== 'string') {
        errors.push('Missing or invalid @type');
    }

    // Tip bazlı validasyon
    switch (s['@type']) {
        case 'FAQPage':
            if (!Array.isArray(s.mainEntity)) {
                errors.push('FAQPage must have mainEntity array');
            }
            break;
        case 'HowTo':
            if (!s.name || !s.step) {
                errors.push('HowTo must have name and step');
            }
            break;
        case 'Service':
            if (!s.name || !s.provider) {
                errors.push('Service must have name and provider');
            }
            break;
    }

    return { valid: errors.length === 0, errors };
}

// Export types
export type {
    FAQPageSchema,
    HowToSchema,
    ServiceSchema,
    BreadcrumbSchema,
};

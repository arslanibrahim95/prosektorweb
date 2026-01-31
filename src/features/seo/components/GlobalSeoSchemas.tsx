import { JsonLd } from './JsonLd';
import { generateOrganizationSchema, generateWebSiteSchema } from '../lib/structured-data';

/**
 * Global SEO schemas for ProsektorWeb - Web Agency
 * - Organization: For Knowledge Panel
 * - WebSite: For search functionality
 */

const organizationSchema = generateOrganizationSchema({
    name: 'ProsektorWeb',
    url: 'https://prosektorweb.com',
    logo: 'https://prosektorweb.com/logo.png',
    description: 'ProsektorWeb, 11 yıllık iş güvenliği uzmanlığı ile OSGB sektörü için profesyonel web sitesi çözümleri sunan bir ajans. İş güvenliği uzmanı kadrosu ile mevzuat uyumu ve dijital dönüşüm.',
    address: {
        addressLocality: 'İstanbul',
        addressRegion: 'Marmara',
        addressCountry: 'TR',
    },
    phone: '+905551234567',
    socialLinks: [
        'https://www.linkedin.com/company/prosektorweb',
        'https://www.twitter.com/prosektorweb',
        'https://www.instagram.com/prosektorweb',
    ],
});

const webSiteSchema = generateWebSiteSchema({
    name: 'ProsektorWeb',
    url: 'https://prosektorweb.com',
    searchUrl: 'https://prosektorweb.com/blog?q={search_term_string}',
});

export function GlobalSeoSchemas() {
    return (
        <>
            <JsonLd data={organizationSchema} />
            <JsonLd data={webSiteSchema} />
        </>
    );
}

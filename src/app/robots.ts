import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    return {
        rules: {
            userAgent: '*',
            allow: ['/', '/llms.txt'],
            disallow: ['/api/', '/admin/', '/portal/', '/proposal/'],
        },
        sitemap: 'https://prosektorweb.com/sitemap.xml',
    }
}

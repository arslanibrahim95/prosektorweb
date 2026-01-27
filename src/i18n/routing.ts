import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
    // A list of all locales that are supported
    locales: ['tr', 'en'],

    // Used when no locale matches
    defaultLocale: 'tr',

    // Optional: Prefix default locale (tr) as well? 
    // User said "Edge-locale test", implies we want explicit locales.
    // Standard practice: / for default, /en for other.
    // Or /tr for default.
    // Let's stick to default prefix strategy (as-needed) or always prefix?
    // User didn't specify. I'll use standard behavior: default locale NOT prefixed?
    // P0 correction: If user wants "tr-TR" vs "en-US", I'll stick to 'tr' and 'en' keys for now simplicty.
    // "prefix: 'as-needed'" is common.
    // "prefix: 'as-needed'" is common.
    localePrefix: 'as-needed',

    // Disable automatic locale detection to prevent unwanted redirects
    // based on Accept-Language header. This ensures / always stays /.
    localeDetection: false
});

export const { Link, redirect, usePathname, useRouter } =
    createNavigation(routing);

/**
 * Analytics Provider Component
 * 
 * GA4 ve Plausible script'lerini yükler
 */

'use client';

import Script from 'next/script';

interface AnalyticsProviderProps {
    children: React.ReactNode;
    nonce?: string;
}

export function AnalyticsProvider({ children, nonce }: AnalyticsProviderProps) {
    const ga4Id = process.env.NEXT_PUBLIC_GA4_ID;
    const plausibleDomain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
    const plausibleHost = process.env.NEXT_PUBLIC_PLAUSIBLE_API_HOST || 'https://plausible.io';

    return (
        <>
            {children}

            {/* Google Analytics 4 */}
            {ga4Id && (
                <>
                    <Script
                        src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`}
                        strategy="afterInteractive"
                        nonce={nonce}
                    />
                    <Script id="ga4-init" strategy="afterInteractive" nonce={nonce}>
                        {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${ga4Id}', {
                page_title: document.title,
                page_location: window.location.href,
                send_page_view: true,
                anonymize_ip: true,
                allow_google_signals: false,
                allow_ad_personalization_signals: false,
                custom_map: {
                  'custom_parameter_1': 'province',
                  'custom_parameter_2': 'service',
                  'custom_parameter_3': 'district'
                }
              });
            `}
                    </Script>
                </>
            )}

            {/* Plausible Analytics */}
            {plausibleDomain && (
                <Script
                    src={`${plausibleHost}/js/script.pageview-props.tagged-events.js`}
                    data-domain={plausibleDomain}
                    strategy="afterInteractive"
                    nonce={nonce}
                />
            )}
        </>
    );
}

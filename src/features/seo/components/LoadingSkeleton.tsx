/**
 * Local SEO Page Loading Skeleton
 * 
 * ISR (Incremental Static Regeneration) sırasında gösterilen yükleme durumu
 */

export function LocalSeoPageSkeleton() {
    return (
        <div className="min-h-screen bg-neutral-50">
            {/* Hero Skeleton */}
            <section className="pt-24 pb-16 bg-gradient-to-b from-brand-50 to-white">
                <div className="max-w-4xl mx-auto px-6 pt-12">
                    {/* Badge */}
                    <div className="h-8 w-48 bg-brand-100 rounded-full mb-6 animate-pulse" />

                    {/* Title */}
                    <div className="h-16 w-3/4 bg-neutral-200 rounded-lg mb-6 animate-pulse" />
                    <div className="h-16 w-1/2 bg-neutral-200 rounded-lg mb-6 animate-pulse" />

                    {/* Description */}
                    <div className="h-6 w-full bg-neutral-100 rounded mb-3 animate-pulse" />
                    <div className="h-6 w-5/6 bg-neutral-100 rounded mb-10 animate-pulse" />

                    {/* CTA Buttons */}
                    <div className="flex gap-4">
                        <div className="h-14 w-40 bg-brand-200 rounded-xl animate-pulse" />
                        <div className="h-14 w-40 bg-neutral-200 rounded-xl animate-pulse" />
                    </div>
                </div>
            </section>

            {/* Content Sections Skeleton */}
            {[1, 2, 3].map((i) => (
                <section key={i} className="py-12">
                    <div className="max-w-3xl mx-auto px-6">
                        {/* Section Title */}
                        <div className="h-10 w-2/3 bg-neutral-200 rounded-lg mb-6 animate-pulse" />

                        {/* Paragraphs */}
                        <div className="space-y-3">
                            <div className="h-5 w-full bg-neutral-100 rounded animate-pulse" />
                            <div className="h-5 w-full bg-neutral-100 rounded animate-pulse" />
                            <div className="h-5 w-4/5 bg-neutral-100 rounded animate-pulse" />
                        </div>

                        {/* List Items */}
                        <div className="mt-6 space-y-2">
                            {[1, 2, 3, 4].map((j) => (
                                <div key={j} className="flex items-center gap-3">
                                    <div className="h-2 w-2 bg-brand-200 rounded-full animate-pulse" />
                                    <div className="h-5 w-3/4 bg-neutral-100 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            ))}

            {/* CTA Section Skeleton */}
            <section className="py-16 bg-brand-600">
                <div className="max-w-3xl mx-auto px-6 text-center">
                    <div className="h-12 w-2/3 bg-brand-500 rounded-lg mx-auto mb-4 animate-pulse" />
                    <div className="h-6 w-1/2 bg-brand-500 rounded mx-auto mb-8 animate-pulse" />
                    <div className="flex justify-center gap-4">
                        <div className="h-14 w-40 bg-white/20 rounded-xl animate-pulse" />
                        <div className="h-14 w-40 bg-brand-700 rounded-xl animate-pulse" />
                    </div>
                </div>
            </section>
        </div>
    );
}

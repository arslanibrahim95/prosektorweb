/**
 * A/B Testing Framework
 * 
 * Headline ve meta description testing
 * Feature flags, statistical significance, automatic winner selection
 */

import { getRedisClient } from '@/features/cache/lib/redis-cache';

// Experiment tipleri
type ExperimentType = 'headline' | 'meta_description' | 'cta_text' | 'hero_layout';

// Experiment durumları
type ExperimentStatus = 'draft' | 'running' | 'paused' | 'completed';

// Variant yapısı
interface Variant {
    id: string;
    name: string;
    content: string;
    weight: number;
    conversions: number;
    impressions: number;
}

// Experiment yapısı
interface Experiment {
    id: string;
    name: string;
    type: ExperimentType;
    status: ExperimentStatus;
    variants: Variant[];
    targetPages: string[]; // URL pattern'leri
    startDate: Date;
    endDate?: Date;
    minSampleSize: number;
    confidenceLevel: number; // 0.95 = 95%
}

// Cache key
const EXPERIMENT_CACHE_PREFIX = 'ab:test:';

/**
 * Experiment oluştur
 */
export async function createExperiment(experiment: Omit<Experiment, 'id'>): Promise<Experiment> {
    const id = `exp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newExperiment: Experiment = { ...experiment, id };

    const client = getRedisClient();
    await client.setex(
        `${EXPERIMENT_CACHE_PREFIX}${id}`,
        60 * 60 * 24 * 30, // 30 gün
        JSON.stringify(newExperiment)
    );

    return newExperiment;
}

/**
 * Experiment getir
 */
export async function getExperiment(id: string): Promise<Experiment | null> {
    const client = getRedisClient();
    const data = await client.get(`${EXPERIMENT_CACHE_PREFIX}${id}`);
    return data ? JSON.parse(data) : null;
}

/**
 * Aktif experiment'leri listele
 */
export async function getActiveExperiments(): Promise<Experiment[]> {
    const client = getRedisClient();
    const keys = await client.keys(`${EXPERIMENT_CACHE_PREFIX}*`);

    const experiments: Experiment[] = [];
    for (const key of keys) {
        const data = await client.get(key);
        if (data) {
            const exp = JSON.parse(data) as Experiment;
            if (exp.status === 'running') {
                experiments.push(exp);
            }
        }
    }

    return experiments;
}

/**
 * Sayfa için aktif experiment'leri bul
 */
export async function getExperimentsForPage(
    pagePath: string,
    type: ExperimentType
): Promise<Experiment[]> {
    const experiments = await getActiveExperiments();
    return experiments.filter(
        (exp) =>
            exp.type === type &&
            exp.targetPages.some((pattern) => {
                // Basit pattern matching
                if (pattern.includes('*')) {
                    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
                    return regex.test(pagePath);
                }
                return pagePath.includes(pattern);
            })
    );
}

/**
 * Kullanıcı için variant seç (weighted random)
 */
export function selectVariant(experiment: Experiment, userId: string): Variant {
    // Kullanıcı ID'sinden hash oluştur (deterministik)
    const hash = hashString(`${experiment.id}:${userId}`);

    // Weighted random selection
    const totalWeight = experiment.variants.reduce((sum, v) => sum + v.weight, 0);
    let random = (hash % totalWeight) / totalWeight;

    for (const variant of experiment.variants) {
        random -= variant.weight / totalWeight;
        if (random <= 0) {
            return variant;
        }
    }

    return experiment.variants[0];
}

/**
 * Impression kaydet
 */
export async function trackImpression(
    experimentId: string,
    variantId: string
): Promise<void> {
    const client = getRedisClient();
    const key = `${EXPERIMENT_CACHE_PREFIX}stats:${experimentId}:${variantId}:impressions`;
    await client.sadd(key, Date.now().toString());
}

/**
 * Conversion kaydet
 */
export async function trackConversion(
    experimentId: string,
    variantId: string,
    conversionType: string
): Promise<void> {
    const client = getRedisClient();
    const key = `${EXPERIMENT_CACHE_PREFIX}stats:${experimentId}:${variantId}:conversions:${conversionType}`;
    await client.sadd(key, Date.now().toString());
}

/**
 * İstatistiksel anlamlılık hesapla (z-test)
 */
export function calculateStatisticalSignificance(
    variantA: Variant,
    variantB: Variant
): { significant: boolean; pValue: number; winner: string | null } {
    const n1 = variantA.impressions;
    const n2 = variantB.impressions;
    const c1 = variantA.conversions;
    const c2 = variantB.conversions;

    if (n1 < 100 || n2 < 100) {
        return { significant: false, pValue: 1, winner: null };
    }

    const p1 = c1 / n1;
    const p2 = c2 / n2;

    const p = (c1 + c2) / (n1 + n2);
    const se = Math.sqrt(p * (1 - p) * (1 / n1 + 1 / n2));

    if (se === 0) {
        return { significant: false, pValue: 1, winner: null };
    }

    const z = (p1 - p2) / se;
    const pValue = 2 * (1 - normalCDF(Math.abs(z)));

    // 95% confidence level
    const significant = pValue < 0.05;

    let winner: string | null = null;
    if (significant) {
        winner = p1 > p2 ? variantA.id : variantB.id;
    }

    return { significant, pValue, winner };
}

/**
 * Experiment sonuçlarını analiz et
 */
export async function analyzeExperiment(experimentId: string): Promise<{
    experiment: Experiment;
    results: Array<{
        variant: Variant;
        conversionRate: number;
        lift: number;
    }>;
    winner: string | null;
    significant: boolean;
}> {
    const experiment = await getExperiment(experimentId);
    if (!experiment) {
        throw new Error('Experiment not found');
    }

    const client = getRedisClient();
    const results = [];

    for (const variant of experiment.variants) {
        const impKey = `${EXPERIMENT_CACHE_PREFIX}stats:${experimentId}:${variant.id}:impressions`;
        const convKey = `${EXPERIMENT_CACHE_PREFIX}stats:${experimentId}:${variant.id}:conversions:cta_click`;

        const impressions = (await client.smembers(impKey)).length;
        const conversions = (await client.smembers(convKey)).length;

        results.push({
            variant: { ...variant, impressions, conversions },
            conversionRate: impressions > 0 ? (conversions / impressions) * 100 : 0,
            lift: 0, // Control'a göre hesaplanacak
        });
    }

    // Control variant'ı (ilk variant) baz alınarak lift hesapla
    const controlRate = results[0]?.conversionRate || 0;
    for (let i = 1; i < results.length; i++) {
        results[i].lift = controlRate > 0
            ? ((results[i].conversionRate - controlRate) / controlRate) * 100
            : 0;
    }

    // İlk iki variant arasında istatistiksel anlamlılık testi
    let winner: string | null = null;
    let significant = false;

    if (experiment.variants.length >= 2) {
        const test = calculateStatisticalSignificance(
            results[0].variant,
            results[1].variant
        );
        winner = test.winner;
        significant = test.significant;
    }

    return {
        experiment,
        results,
        winner,
        significant,
    };
}

/**
 * Kazanan variant'ı otomatik uygula
 */
export async function applyWinner(experimentId: string): Promise<void> {
    const analysis = await analyzeExperiment(experimentId);

    if (!analysis.significant || !analysis.winner) {
        throw new Error('No significant winner found');
    }

    const experiment = analysis.experiment;
    const winnerVariant = experiment.variants.find((v) => v.id === analysis.winner);

    if (!winnerVariant) {
        throw new Error('Winner variant not found');
    }

    // TODO: Kazanan içeriği production'a uygula
    // Bu kısım content pipeline'a entegre edilecek

    // Experiment'i tamamlandı olarak işaretle
    experiment.status = 'completed';
    experiment.endDate = new Date();

    const client = getRedisClient();
    await client.setex(
        `${EXPERIMENT_CACHE_PREFIX}${experimentId}`,
        60 * 60 * 24 * 90, // 90 gün daha sakla
        JSON.stringify(experiment)
    );
}

// Yardımcı fonksiyonlar

function hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
    }
    return Math.abs(hash);
}

function normalCDF(x: number): number {
    const t = 1 / (1 + 0.2316419 * Math.abs(x));
    const d = 0.3989423 * Math.exp((-x * x) / 2);
    const prob =
        d *
        t *
        (0.3193815 +
            t * (-0.3565638 + t * (1.781478 + t * (-1.821256 + t * 1.330274))));

    if (x > 0) {
        return 1 - prob;
    }
    return prob;
}

// Export types
export type { Experiment, Variant, ExperimentType, ExperimentStatus };

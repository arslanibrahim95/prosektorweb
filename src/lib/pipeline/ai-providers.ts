/**
 * AI Provider Configuration for Pipeline Stages
 *
 * Each stage uses a specific AI provider optimized for the task:
 * - Claude CLI: Architecture & Design decisions
 * - ChatGPT: Content generation
 * - Gemini: Site/code generation
 * - Codex: Code review & quality control
 */

export type AIProvider = "claude" | "chatgpt" | "gemini" | "codex" | "manual";

export interface AIProviderConfig {
  provider: AIProvider;
  model: string;
  apiKeyEnv: string;
  endpoint?: string;
  maxTokens?: number;
  temperature?: number;
  description: string;
}

// Provider configurations
export const AI_PROVIDERS: Record<AIProvider, AIProviderConfig> = {
  claude: {
    provider: "claude",
    model: "claude-sonnet-4-20250514",
    apiKeyEnv: "ANTHROPIC_API_KEY",
    endpoint: "https://api.anthropic.com/v1/messages",
    maxTokens: 8192,
    temperature: 0.7,
    description: "Mimari kararlar ve tasarim planlama",
  },
  chatgpt: {
    provider: "chatgpt",
    model: "gpt-4o",
    apiKeyEnv: "OPENAI_API_KEY",
    endpoint: "https://api.openai.com/v1/chat/completions",
    maxTokens: 4096,
    temperature: 0.8,
    description: "Icerik uretimi ve metin yazimi",
  },
  gemini: {
    provider: "gemini",
    model: "gemini-2.0-flash",
    apiKeyEnv: "GOOGLE_AI_API_KEY",
    endpoint: "https://generativelanguage.googleapis.com/v1beta/models",
    maxTokens: 8192,
    temperature: 0.7,
    description: "Site ve kod uretimi",
  },
  codex: {
    provider: "codex",
    model: "codex-mini-latest",
    apiKeyEnv: "OPENAI_API_KEY",
    endpoint: "https://api.openai.com/v1/responses",
    maxTokens: 4096,
    temperature: 0.2,
    description: "Kod inceleme ve kalite kontrol",
  },
  manual: {
    provider: "manual",
    model: "human",
    apiKeyEnv: "",
    description: "Manuel islem - insan mudahalesi gerekli",
  },
};

// Stage to AI Provider mapping
export interface StageAIConfig {
  primary: AIProvider;
  fallback?: AIProvider;
  isAutomated: boolean;
  systemPrompt?: string;
}

export const STAGE_AI_CONFIG: Record<string, StageAIConfig> = {
  input: {
    primary: "manual",
    isAutomated: false,
  },
  research: {
    primary: "gemini",
    fallback: "chatgpt",
    isAutomated: true,
    systemPrompt: `Sen bir web projesi arastirma uzmanisin. Verilen firma bilgilerine gore:
1. Sektor analizi yap
2. Rakip web sitelerini analiz et
3. Anahtar kelime onerileri sun
4. Hedef kitle analizi yap

Turkce yanit ver. JSON formatinda cikti uret.`,
  },
  design: {
    primary: "claude",
    fallback: "chatgpt",
    isAutomated: true,
    systemPrompt: `Sen bir UI/UX ve web tasarim mimarisin. Verilen arastirma ve firma bilgilerine gore:
1. Renk paleti olustur (hex kodlari ile)
2. Tipografi secimi yap
3. Layout yapisi belirle
4. Komponent stilleri tanimla

Modern, erisilebilir ve SEO-friendly tasarimlar olustur.
Turkce aciklamalar, JSON formatinda cikti.`,
  },
  content: {
    primary: "chatgpt",
    fallback: "claude",
    isAutomated: true,
    systemPrompt: `Sen profesyonel bir icerik yazarisin. Verilen tasarim ve firma bilgilerine gore:
1. Sayfa iceriklerini yaz (anasayfa, hakkimizda, hizmetler, iletisim)
2. SEO uyumlu basliklar ve meta aciklamalar olustur
3. CTA (Call-to-Action) metinleri yaz
4. SSS (FAQ) icerikleri hazirla

Turkce, akici, profesyonel ve ikna edici icerikler uret.
Hedef kitleye uygun ton kullan.`,
  },
  seo: {
    primary: "gemini",
    fallback: "chatgpt",
    isAutomated: true,
    systemPrompt: `Sen bir SEO uzmanisin. Verilen icerik ve site yapisina gore:
1. robots.txt olustur
2. sitemap.xml hazirla
3. Schema.org JSON-LD verileri uret
4. Meta tag optimizasyonu yap
5. Open Graph ve Twitter Card tanimla

Teknik SEO en iyi pratiklerini uygula.`,
  },
  build: {
    primary: "gemini",
    fallback: "claude",
    isAutomated: true,
    systemPrompt: `Sen bir Next.js ve React uzmanisin. Verilen tasarim ve iceriklere gore:
1. Next.js 15 App Router yapisi olustur
2. Tailwind CSS ile responsive tasarim uygula
3. Shadcn/ui komponentleri kullan
4. Performans optimizasyonu yap
5. Erisilebilirlik standartlarini uygula

Production-ready, temiz ve surdurulebilir kod uret.`,
  },
  review: {
    primary: "codex",
    fallback: "claude",
    isAutomated: true,
    systemPrompt: `Sen bir kod ve web sitesi kalite kontrol uzmanisin. Uretilen siteyi incele:
1. Kod kalitesi ve best practices
2. Guvenlik aciklari
3. Performans metrikleri
4. SEO uyumluluk
5. Erisilebilirlik (WCAG)
6. Responsive tasarim
7. Cross-browser uyumluluk

Detayli rapor ve iyilestirme onerileri sun.`,
  },
  publish: {
    primary: "manual",
    isAutomated: false,
  },
};

/**
 * Get AI provider config for a stage
 */
export function getStageAIProvider(stage: string): {
  config: AIProviderConfig;
  stageConfig: StageAIConfig;
} {
  const stageConfig = STAGE_AI_CONFIG[stage] || STAGE_AI_CONFIG.input;
  const config = AI_PROVIDERS[stageConfig.primary];

  return { config, stageConfig };
}

/**
 * Check if AI provider is configured (API key exists)
 */
export function isProviderConfigured(provider: AIProvider): boolean {
  if (provider === "manual") return true;

  const config = AI_PROVIDERS[provider];
  return !!process.env[config.apiKeyEnv];
}

/**
 * Get available providers for a stage (configured ones only)
 */
export function getAvailableProvidersForStage(stage: string): AIProvider[] {
  const stageConfig = STAGE_AI_CONFIG[stage];
  if (!stageConfig) return ["manual"];

  const available: AIProvider[] = [];

  if (isProviderConfigured(stageConfig.primary)) {
    available.push(stageConfig.primary);
  }

  if (stageConfig.fallback && isProviderConfigured(stageConfig.fallback)) {
    available.push(stageConfig.fallback);
  }

  // Always allow manual as last resort
  if (!available.includes("manual")) {
    available.push("manual");
  }

  return available;
}

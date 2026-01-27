#!/bin/bash
#
# AI Pipeline Orchestrator v2.0
# Cost-optimized web project generation with:
# - Image generation (Gemini Imagen)
# - Enhanced SEO optimization
#
# Usage: ./ai-pipeline.sh <project-name> "<project-description>"
#
# Pipeline Stages:
# 1. INPUT    -> Manual project info
# 2. RESEARCH -> Gemini Flash (sector analysis)
# 3. DESIGN   -> GLM-4 Plus (JSON structure)
# 4. IMAGES   -> Gemini Imagen (hero, icons, backgrounds) [NEW]
# 5. CONTENT  -> GLM-4 Flash (page content)
# 6. SEO      -> Gemini Flash (enhanced SEO) [ENHANCED]
# 7. BUILD    -> Claude Sonnet (code generation)
# 8. REVIEW   -> Codex/GPT-4o (quality check)
# 9. PUBLISH  -> Vercel deploy

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

# Check arguments
if [ $# -lt 2 ]; then
    echo -e "${RED}Kullanim: $0 <proje-adi> \"<proje-aciklamasi>\"${NC}"
    echo ""
    echo "Ornekler:"
    echo "  $0 acme-web \"ACME sirketleri icin kurumsal web sitesi\""
    echo "  $0 osgb-demo \"OSGB firmalari icin is sagligi hizmetleri sitesi\""
    exit 1
fi

PROJECT_NAME=$1
PROJECT_DESC=$2
WORK_DIR="./pipeline-output/${PROJECT_NAME}"
IMAGES_DIR="${WORK_DIR}/images"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)

# Create directories
mkdir -p "$WORK_DIR" "$IMAGES_DIR"
echo -e "${GREEN}Calisma dizini: $WORK_DIR${NC}"

# Log file
LOG_FILE="$WORK_DIR/pipeline_${TIMESTAMP}.log"
exec > >(tee -a "$LOG_FILE") 2>&1

echo "╔══════════════════════════════════════════════════════════════╗"
echo "║           AI PIPELINE v2.0 - GORSEL + SEO DESTEKLI           ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║ Proje: $PROJECT_NAME"
echo "║ Zaman: $(date)"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Stage tracking
TOTAL_STAGES=9
CURRENT_STAGE=0

progress_bar() {
    local current=$1
    local total=$2
    local width=40
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))

    printf "\r[${GREEN}"
    printf "%${filled}s" '' | tr ' ' '█'
    printf "${NC}"
    printf "%${empty}s" '' | tr ' ' '░'
    printf "] %d%% (%d/%d)" $percentage $current $total
}

run_stage() {
    local stage_num=$1
    local stage_name=$2
    local input_file=$3
    local output_file=$4
    local cli_cmd=$5
    local model=$6
    local system_prompt=$7

    CURRENT_STAGE=$stage_num
    echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${PURPLE}[${stage_num}/${TOTAL_STAGES}] ${stage_name}${NC}"
    echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    progress_bar $stage_num $TOTAL_STAGES
    echo ""

    local start_time=$(date +%s)

    # Check if CLI exists
    if ! command -v ${cli_cmd%% *} &> /dev/null; then
        echo -e "${YELLOW}Uyari: ${cli_cmd%% *} bulunamadi. Simule ediliyor...${NC}"
        # Simulate output for demo
        echo "# ${stage_name} Output (Simulated)" > "$output_file"
        echo "CLI tool not available. Install with: npm install -g @${cli_cmd%% *}" >> "$output_file"
    else
        echo -e "${CYAN}Provider: ${cli_cmd%% *} (${model})${NC}"
        if [ -f "$input_file" ]; then
            cat "$input_file" | $cli_cmd chat --model "$model" --system "$system_prompt" > "$output_file" 2>/dev/null || true
        else
            echo "$PROJECT_DESC" | $cli_cmd chat --model "$model" --system "$system_prompt" > "$output_file" 2>/dev/null || true
        fi
    fi

    local end_time=$(date +%s)
    local duration=$((end_time - start_time))

    if [ -f "$output_file" ] && [ -s "$output_file" ]; then
        local size=$(wc -c < "$output_file")
        echo -e "${GREEN}✓ Tamamlandi (${duration}s, ${size} bytes)${NC}"
    else
        echo -e "${YELLOW}⚠ Cikti bos veya hata olustu${NC}"
    fi
}

# ========================================
# STAGE 1: INPUT
# ========================================
echo -e "\n${PURPLE}[1/${TOTAL_STAGES}] INPUT${NC}"
cat > "$WORK_DIR/0_input.json" << EOF
{
  "projectName": "${PROJECT_NAME}",
  "description": "${PROJECT_DESC}",
  "timestamp": "$(date -Iseconds)",
  "domain": "${PROJECT_NAME}.com"
}
EOF
echo -e "${GREEN}✓ Proje bilgileri kaydedildi${NC}"

# ========================================
# STAGE 2: RESEARCH (Gemini Flash)
# ========================================
RESEARCH_PROMPT="Sen bir web projesi arastirma uzmanisin. Verilen proje fikri icin detayli analiz yap:

## Cikti Formati (Markdown):

### 1. Sektor Analizi
- Sektor adi ve ozellikleri
- Pazar buyuklugu
- Buyume trendi

### 2. Hedef Kitle
- Demografik ozellikler
- Ihtiyaclar ve beklentiler
- Online davranislar

### 3. Rakip Analizi
- 3-5 rakip site ornegi
- Guclu yonleri
- Zayif yonleri

### 4. Anahtar Kelimeler
- Ana anahtar kelimeler (5-10)
- Uzun kuyruk kelimeler (10-15)
- Yerel SEO kelimeleri

### 5. Sayfa Yapisi Onerisi
- Anasayfa
- Hakkimizda
- Hizmetler
- Iletisim
- Blog (opsiyonel)

### 6. Teknik Gereksinimler
- Onerilen teknolojiler
- Entegrasyonlar
- Performans gereksinimleri"

run_stage 2 "RESEARCH (Gemini)" \
    "$WORK_DIR/0_input.json" \
    "$WORK_DIR/1_research.md" \
    "gemini" "gemini-2.0-flash" \
    "$RESEARCH_PROMPT"

# ========================================
# STAGE 3: DESIGN (GLM-4 Plus)
# ========================================
DESIGN_PROMPT='Sen bir sistem mimari ve UI/UX tasarimcisin. Arastirma raporunu analiz ederek asagidaki JSON yapisini olustur:

{
  "siteName": "Site Adi",
  "tagline": "Kisa slogan",
  "pages": [
    {
      "name": "Anasayfa",
      "slug": "/",
      "sections": ["hero", "features", "testimonials", "cta"]
    }
  ],
  "colors": {
    "primary": "#hex",
    "primaryLight": "#hex",
    "primaryDark": "#hex",
    "secondary": "#hex",
    "accent": "#hex",
    "background": "#hex",
    "surface": "#hex",
    "text": "#hex",
    "textMuted": "#hex"
  },
  "typography": {
    "headingFont": "Font adi",
    "bodyFont": "Font adi",
    "scale": "normal"
  },
  "layout": {
    "style": "modern",
    "heroType": "gradient",
    "navStyle": "sticky",
    "footerStyle": "columns"
  },
  "components": ["Hero", "FeatureCard", "Testimonial", "CTA", "ContactForm"],
  "images": {
    "hero": {
      "prompt": "Gorsel icin detayli prompt",
      "style": "modern, professional",
      "dimensions": "1920x1080"
    },
    "features": [
      {"prompt": "Ozellik 1 ikonu", "style": "flat icon"}
    ]
  }
}

SADECE JSON ver. Aciklama yapma.'

run_stage 3 "DESIGN (GLM)" \
    "$WORK_DIR/1_research.md" \
    "$WORK_DIR/2_design.json" \
    "glm" "glm-4-plus" \
    "$DESIGN_PROMPT"

# ========================================
# STAGE 4: IMAGES (Gemini Imagen) [NEW]
# ========================================
echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}[4/${TOTAL_STAGES}] IMAGES (Gemini Imagen)${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
progress_bar 4 $TOTAL_STAGES
echo ""

# Extract image prompts from design JSON and generate images
if command -v gemini-imagen &> /dev/null; then
    echo -e "${CYAN}Provider: Gemini Imagen (imagen-3.0)${NC}"

    # Generate Hero Image
    echo -e "${BLUE}Generating hero image...${NC}"
    HERO_PROMPT="Professional corporate website hero image, modern gradient background, business theme, clean and minimal, 4K quality"
    gemini-imagen generate --prompt "$HERO_PROMPT" --output "$IMAGES_DIR/hero.webp" --width 1920 --height 1080 2>/dev/null || true

    # Generate Feature Icons
    echo -e "${BLUE}Generating feature icons...${NC}"
    for i in 1 2 3 4; do
        ICON_PROMPT="Minimal flat icon for business feature, single color, clean design, 256x256"
        gemini-imagen generate --prompt "$ICON_PROMPT" --output "$IMAGES_DIR/feature-${i}.webp" --width 256 --height 256 2>/dev/null || true
    done

    # Generate Background Pattern
    echo -e "${BLUE}Generating background pattern...${NC}"
    BG_PROMPT="Subtle geometric pattern for website background, light colors, professional, seamless tile"
    gemini-imagen generate --prompt "$BG_PROMPT" --output "$IMAGES_DIR/background.webp" --width 800 --height 800 2>/dev/null || true

else
    echo -e "${YELLOW}Gemini Imagen CLI bulunamadi. Placeholder gorseller kullanilacak.${NC}"
    # Create placeholder image manifest
    cat > "$WORK_DIR/3_images.json" << 'EOF'
{
  "images": [
    {
      "id": "hero",
      "type": "hero",
      "prompt": "Professional corporate website hero image",
      "url": "https://placehold.co/1920x1080/1E40AF/FFFFFF?text=Hero+Image",
      "width": 1920,
      "height": 1080,
      "format": "webp",
      "altText": "Ana sayfa hero gorseli"
    },
    {
      "id": "feature-1",
      "type": "icon",
      "prompt": "Feature icon 1",
      "url": "https://placehold.co/256x256/1E40AF/FFFFFF?text=Icon+1",
      "width": 256,
      "height": 256,
      "format": "webp",
      "altText": "Ozellik 1 ikonu"
    },
    {
      "id": "feature-2",
      "type": "icon",
      "prompt": "Feature icon 2",
      "url": "https://placehold.co/256x256/1E40AF/FFFFFF?text=Icon+2",
      "width": 256,
      "height": 256,
      "format": "webp",
      "altText": "Ozellik 2 ikonu"
    },
    {
      "id": "feature-3",
      "type": "icon",
      "prompt": "Feature icon 3",
      "url": "https://placehold.co/256x256/1E40AF/FFFFFF?text=Icon+3",
      "width": 256,
      "height": 256,
      "format": "webp",
      "altText": "Ozellik 3 ikonu"
    },
    {
      "id": "feature-4",
      "type": "icon",
      "prompt": "Feature icon 4",
      "url": "https://placehold.co/256x256/1E40AF/FFFFFF?text=Icon+4",
      "width": 256,
      "height": 256,
      "format": "webp",
      "altText": "Ozellik 4 ikonu"
    },
    {
      "id": "background",
      "type": "background",
      "prompt": "Subtle geometric pattern",
      "url": "https://placehold.co/800x800/F3F4F6/E5E7EB?text=Pattern",
      "width": 800,
      "height": 800,
      "format": "webp",
      "altText": "Arkaplan deseni"
    }
  ],
  "totalImages": 6,
  "generatedAt": "$(date -Iseconds)"
}
EOF
fi

echo -e "${GREEN}✓ Gorsel manifest olusturuldu${NC}"

# ========================================
# STAGE 5: CONTENT (GLM-4 Flash)
# ========================================
CONTENT_PROMPT='Sen profesyonel bir icerik yazarisin. Tasarim ve gorsel bilgilerini kullanarak her sayfa icin icerik uret:

## Her Sayfa Icin:

### Sayfa: [Sayfa Adi]
**Meta Title:** (max 60 karakter)
**Meta Description:** (max 160 karakter)
**Keywords:** kelime1, kelime2, kelime3

#### Hero Bolumu
- Baslik (H1)
- Alt baslik
- CTA butonu metni

#### Ana Icerik
- Paragraflar
- Ozellik listesi
- Istatistikler (varsa)

#### CTA Bolumu
- Eylem cagrisi basligi
- Aciklama
- Buton metni

---

Turkce, SEO uyumlu, akici ve ikna edici icerikler uret.
Her sayfada en az 300 kelime olsun.
Gorsel referanslarini (hero, feature-1 vb.) metinde belirt.'

# Combine design and images for content
cat "$WORK_DIR/2_design.json" "$WORK_DIR/3_images.json" 2>/dev/null > "$WORK_DIR/3.5_design_images.json" || cp "$WORK_DIR/2_design.json" "$WORK_DIR/3.5_design_images.json"

run_stage 5 "CONTENT (GLM)" \
    "$WORK_DIR/3.5_design_images.json" \
    "$WORK_DIR/4_content.md" \
    "glm" "glm-4-flash" \
    "$CONTENT_PROMPT"

# ========================================
# STAGE 6: SEO (Gemini Flash) [ENHANCED]
# ========================================
SEO_PROMPT='Sen bir SEO uzmanisin. Icerik ve site yapisini analiz ederek kapsamli SEO dosyalari olustur:

## 1. robots.txt
```txt
User-agent: *
Allow: /
Sitemap: https://DOMAIN/sitemap.xml
```

## 2. sitemap.xml
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://DOMAIN/</loc>
    <lastmod>DATE</lastmod>
    <changefreq>weekly</changefreq>
    <priority>1.0</priority>
  </url>
  <!-- Diger sayfalar -->
</urlset>
```

## 3. JSON-LD Structured Data

### Organization Schema
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Firma Adi",
  "url": "https://DOMAIN",
  "logo": "https://DOMAIN/logo.png",
  "sameAs": []
}
```

### WebSite Schema
```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Site Adi",
  "url": "https://DOMAIN"
}
```

### LocalBusiness Schema (varsa)
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Firma Adi"
}
```

### FAQPage Schema (SSS varsa)
```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": []
}
```

## 4. Meta Tag Onerileri

Her sayfa icin:
- title (max 60 karakter)
- description (max 160 karakter)
- keywords
- og:title, og:description, og:image
- twitter:card, twitter:title, twitter:description

## 5. SEO Kontrol Listesi

- [ ] H1 basligi her sayfada tek
- [ ] Gorsel alt metinleri
- [ ] Internal linking
- [ ] Mobile uyumluluk
- [ ] Sayfa yukleme hizi
- [ ] SSL sertifikasi
- [ ] Canonical URL
- [ ] Hreflang (coklu dil icin)

## 6. Anahtar Kelime Stratejisi

| Kelime | Arama Hacmi | Zorluk | Sayfa |
|--------|-------------|--------|-------|
| Ana kelime | Yuksek | Orta | Anasayfa |

## 7. Backlink Onerileri

- Sektor dizinleri
- Yerel is rehberleri
- Sosyal medya profilleri'

# Combine all previous outputs for SEO analysis
cat "$WORK_DIR/1_research.md" "$WORK_DIR/2_design.json" "$WORK_DIR/4_content.md" > "$WORK_DIR/4.5_all_content.md"

run_stage 6 "SEO (Gemini - Enhanced)" \
    "$WORK_DIR/4.5_all_content.md" \
    "$WORK_DIR/5_seo.md" \
    "gemini" "gemini-2.0-flash" \
    "$SEO_PROMPT"

# ========================================
# STAGE 7: BUILD (Claude Sonnet)
# ========================================
BUILD_PROMPT='Sen uzman bir Next.js 15 geliştiricisisin. Tasarim, icerik ve SEO bilgilerini kullanarak production-ready kod uret:

## Dosya Yapisi:

### 1. app/layout.tsx
- Root layout
- SEO meta tags (next/head veya metadata API)
- JSON-LD script
- Analytics scripts
- Font yuklemesi

### 2. app/page.tsx
- Hero section (gorsel referansi ile)
- Features section
- Testimonials
- CTA section

### 3. app/globals.css
- Tailwind imports
- Custom CSS variables (tasarimdaki renkler)
- Animasyonlar

### 4. tailwind.config.ts
- Renk paleti (tasarimdan)
- Font tanimlari
- Ozel spacing/sizing

### 5. components/Hero.tsx
- Responsive hero
- Gorsel optimizasyonu (next/image)
- Animasyonlar

### 6. components/FeatureCard.tsx
- Ikon destegi
- Hover efektleri

### 7. components/SEO.tsx
- Reusable SEO component
- JSON-LD inject

### 8. lib/seo.ts
- SEO utility fonksiyonlari
- Metadata generator

## Kurallar:
- TypeScript strict mode
- next/image ile gorsel optimizasyonu
- Semantic HTML (a11y)
- Mobile-first responsive
- Core Web Vitals optimize

SADECE kod uret. Her dosyayi ayri code block icinde ver.'

run_stage 7 "BUILD (Claude)" \
    "$WORK_DIR/4.5_all_content.md" \
    "$WORK_DIR/6_code.md" \
    "claude" "claude-sonnet-4-20250514" \
    "$BUILD_PROMPT"

# ========================================
# STAGE 8: REVIEW (Codex/GPT-4o)
# ========================================
REVIEW_PROMPT='Sen bir kod ve SEO kalite kontrol uzmanisin. Uretilen kodu ve SEO yapisini incele:

## Kod Inceleme

### 1. Guvenlik
- [ ] XSS korunmasi
- [ ] CSRF korunmasi
- [ ] Input sanitization
- [ ] Environment variable kullanimi

### 2. Performans
- [ ] Image optimization
- [ ] Code splitting
- [ ] Lazy loading
- [ ] Bundle size

### 3. TypeScript
- [ ] Tip guvenligi
- [ ] any kullanimi yok
- [ ] Interface tanimlari

### 4. React Best Practices
- [ ] Key props
- [ ] useCallback/useMemo
- [ ] Error boundaries

### 5. Erisilebilirlik (a11y)
- [ ] ARIA labels
- [ ] Keyboard navigation
- [ ] Color contrast
- [ ] Screen reader uyumu

## SEO Inceleme

### 1. Teknik SEO
- [ ] Meta tags dogru
- [ ] Structured data valid
- [ ] Canonical URL
- [ ] Sitemap dogru

### 2. Icerik SEO
- [ ] H1 kullanimi
- [ ] Keyword yogunlugu
- [ ] Alt text
- [ ] Internal linking

### 3. Core Web Vitals
- [ ] LCP tahmini
- [ ] FID/INP tahmini
- [ ] CLS tahmini

## Sonuc

Sorun varsa:
```
SORUN: [Aciklama]
COZUM: [Duzeltilmis kod]
```

Sorun yoksa:
```
APPROVED - Kod ve SEO production icin hazir.
Tahmini Lighthouse Skoru: XX/100
```'

run_stage 8 "REVIEW (Codex)" \
    "$WORK_DIR/6_code.md" \
    "$WORK_DIR/7_review.md" \
    "codex" "gpt-4o" \
    "$REVIEW_PROMPT"

# ========================================
# STAGE 9: PUBLISH INFO
# ========================================
echo -e "\n${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${PURPLE}[9/${TOTAL_STAGES}] PUBLISH INFO${NC}"
echo -e "${PURPLE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

cat > "$WORK_DIR/8_deploy.md" << EOF
# Deploy Talimatlari

## Vercel ile Deploy

\`\`\`bash
# 1. Proje dizinine git
cd generated-site

# 2. Vercel CLI ile deploy
npx vercel

# 3. Production deploy
npx vercel --prod
\`\`\`

## Environment Variables

\`\`\`env
NEXT_PUBLIC_SITE_URL=https://${PROJECT_NAME}.vercel.app
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
\`\`\`

## Post-Deploy Checklist

- [ ] SSL aktif
- [ ] Domain baglantisi
- [ ] Google Search Console
- [ ] Google Analytics
- [ ] robots.txt test
- [ ] sitemap.xml test
- [ ] Lighthouse audit
- [ ] Mobile test
EOF

echo -e "${GREEN}✓ Deploy talimatlari olusturuldu${NC}"

# ========================================
# SUMMARY
# ========================================
echo ""
echo "╔══════════════════════════════════════════════════════════════╗"
echo "║                    PIPELINE TAMAMLANDI!                      ║"
echo "╠══════════════════════════════════════════════════════════════╣"
echo "║                                                              ║"
echo "║  Cikti Dosyalari:                                           ║"
echo "║  ├── 0_input.json        (Proje bilgileri)                  ║"
echo "║  ├── 1_research.md       (Sektor analizi)                   ║"
echo "║  ├── 2_design.json       (UI/UX tasarim)                    ║"
echo "║  ├── 3_images.json       (Gorsel manifest)                  ║"
echo "║  ├── 4_content.md        (Sayfa icerikleri)                 ║"
echo "║  ├── 5_seo.md            (SEO dosyalari)                    ║"
echo "║  ├── 6_code.md           (Next.js kodu)                     ║"
echo "║  ├── 7_review.md         (Kalite raporu)                    ║"
echo "║  └── 8_deploy.md         (Deploy talimatlari)               ║"
echo "║                                                              ║"
echo -e "║  Gorseller: ${CYAN}${IMAGES_DIR}${NC}                              ║"
echo "║                                                              ║"
echo "╚══════════════════════════════════════════════════════════════╝"
echo ""

# Check review result
if grep -q "APPROVED" "$WORK_DIR/7_review.md" 2>/dev/null; then
    echo -e "${GREEN}✓ Kod Incelemesi: ONAYLANDI${NC}"
    echo -e "  Sonraki adim: ${CYAN}cd $WORK_DIR && vercel${NC}"
else
    echo -e "${YELLOW}⚠ Kod Incelemesi: DUZELTME GEREKEBILIR${NC}"
    echo -e "  Detaylar: ${CYAN}cat $WORK_DIR/7_review.md${NC}"
fi

echo ""
echo -e "Log dosyasi: ${CYAN}$LOG_FILE${NC}"
echo -e "Toplam boyut: ${YELLOW}$(du -sh "$WORK_DIR" | cut -f1)${NC}"
echo ""

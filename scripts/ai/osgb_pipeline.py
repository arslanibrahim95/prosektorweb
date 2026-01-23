#!/usr/bin/env python3
"""
OSGB Content Pipeline Wrapper

ProSektorWeb için OSGB-özel içerik üretim wrapper'ı.
claude-code-maestro content_pipeline.py üzerine OSGB context ekler.
"""

import os
import sys
import json
from pathlib import Path

# Script dizinini path'e ekle
SCRIPT_DIR = Path(__file__).parent
sys.path.insert(0, str(SCRIPT_DIR))

from content_pipeline import ContentPipeline, ContentRequest, ContentResult

# OSGB Özel Promptlar
OSGB_PROMPTS = {
    "homepage": """
{company_name} firması için bir anasayfa içeriği oluştur.

Firma Bilgileri:
- Firma Adı: {company_name}
- Sektör: İş Sağlığı ve Güvenliği (OSGB)
- Hizmetler: {services}
{extra_info}

İçerik şunları içermeli:
1. Dikkat çekici bir başlık ve açıklama (Hero bölümü)
2. Sunulan hizmetlerin kısa tanıtımı
3. Neden bizi seçmelisiniz bölümü
4. Çağrı butonları için uygun metinler (CTA)

HTML formatında yaz. Meta bilgileri ekle:
META_TITLE: (max 60 karakter)
META_DESCRIPTION: (max 160 karakter)
""",

    "about": """
{company_name} firması için bir "Hakkımızda" sayfası içeriği oluştur.

Firma Bilgileri:
- Firma Adı: {company_name}
- Sektör: İş Sağlığı ve Güvenliği (OSGB)
{extra_info}

İçerik şunları içermeli:
1. Firma hikayesi ve kuruluş amacı
2. Misyon ve vizyon
3. Değerlerimiz
4. Ekibimiz hakkında genel bilgi

Profesyonel ve güven veren bir ton kullan. HTML formatında yaz.
META_TITLE: (max 60 karakter)
META_DESCRIPTION: (max 160 karakter)
""",

    "services": """
{company_name} firması için bir "Hizmetlerimiz" sayfası içeriği oluştur.

Firma Bilgileri:
- Firma Adı: {company_name}
- Hizmetler: {services}

Her hizmet için:
1. Hizmet başlığı
2. Hizmet açıklaması (2-3 paragraf)
3. Bu hizmetin faydaları

Hizmetleri <section> etiketleriyle ayır. HTML formatında yaz.
META_TITLE: (max 60 karakter)
META_DESCRIPTION: (max 160 karakter)
""",

    "contact": """
{company_name} firması için bir "İletişim" sayfası içeriği oluştur.

Firma Bilgileri:
- Firma Adı: {company_name}
- Adres: {address}
- Telefon: {phone}
- E-posta: {email}

İçerik şunları içermeli:
1. Davetkar bir başlık
2. İletişim bilgileri listesi
3. Çalışma saatleri (varsayılan: Pazartesi-Cuma 09:00-18:00)
4. İletişim formu için yönlendirme metni

HTML formatında yaz.
META_TITLE: (max 60 karakter)
META_DESCRIPTION: (max 160 karakter)
""",

    "faq": """
{company_name} firması için bir "Sıkça Sorulan Sorular" sayfası içeriği oluştur.

Firma Bilgileri:
- Firma Adı: {company_name}
- Hizmetler: {services}

En az 8 soru-cevap oluştur. Sorular şunları kapsamalı:
1. OSGB nedir?
2. Hangi işletmeler OSGB hizmeti almak zorundadır?
3. İşyeri hekimi ve iş güvenliği uzmanı görevleri
4. Risk değerlendirmesi nedir?
5. İSG eğitimleri hakkında
6. Hizmet ücretlendirmesi
7. Sözleşme süreci
8. Denetimler hakkında

Her soru-cevabı <div class="faq-item"> içinde yaz. HTML formatında yaz.
META_TITLE: (max 60 karakter)
META_DESCRIPTION: (max 160 karakter)
""",

    "blog": """
{company_name} firması için İş Sağlığı ve Güvenliği hakkında bir blog yazısı oluştur.

Konu: {topic}

İçerik şunları içermeli:
1. SEO uyumlu başlık
2. Giriş paragrafı (okuyucuyu çeken)
3. Ana içerik (3-4 alt başlık ile, her biri 2-3 paragraf)
4. Sonuç ve çağrı

Yazı uzunluğu: yaklaşık 1000-1500 kelime
HTML formatında, SEO uyumlu yaz.
META_TITLE: (max 60 karakter)
META_DESCRIPTION: (max 160 karakter)
"""
}

DEFAULT_SERVICES = [
    "İşyeri Hekimliği",
    "İş Güvenliği Uzmanlığı",
    "Risk Değerlendirmesi",
    "İSG Eğitimleri",
    "Sağlık Gözetimi",
    "Ortam Ölçümleri"
]


class OSGBContentPipeline:
    """OSGB-özel içerik pipeline'ı."""
    
    def __init__(self):
        config_path = SCRIPT_DIR / "config" / "model-config.json"
        self.pipeline = ContentPipeline(str(config_path) if config_path.exists() else None)
    
    def generate_page(
        self,
        content_type: str,
        company_name: str,
        services: list = None,
        address: str = None,
        phone: str = None,
        email: str = None,
        topic: str = None,
        extra_info: str = ""
    ) -> ContentResult:
        """
        OSGB sayfası için içerik üret.
        
        Args:
            content_type: homepage, about, services, contact, faq, blog
            company_name: Firma adı
            services: Sunulan hizmetler
            address: Adres
            phone: Telefon
            email: E-posta
            topic: Blog konusu (sadece blog için)
            extra_info: Ek bilgi
        
        Returns:
            ContentResult
        """
        services = services or DEFAULT_SERVICES
        services_str = ", ".join(services)
        
        # Prompt şablonunu al
        prompt_template = OSGB_PROMPTS.get(content_type.lower())
        if not prompt_template:
            prompt_template = OSGB_PROMPTS["homepage"]
        
        # Prompt'u doldur
        prompt = prompt_template.format(
            company_name=company_name,
            services=services_str,
            address=address or "Belirtilmemiş",
            phone=phone or "Belirtilmemiş",
            email=email or "Belirtilmemiş",
            topic=topic or "İşyerinde Güvenlik Kültürü",
            extra_info=extra_info
        )
        
        # Context
        context = {
            "industry": "OSGB",
            "language": "tr",
            "tone": "professional"
        }
        
        # Generate
        return self.pipeline.generate(
            content_type=content_type.lower(),
            topic=f"{company_name} - {content_type}",
            context=context,
            with_review=True,
            auto_revise=True
        )
    
    def generate_full_site(
        self,
        company_name: str,
        services: list = None,
        address: str = None,
        phone: str = None,
        email: str = None
    ) -> dict:
        """Tüm site sayfalarını üret."""
        results = {}
        page_types = ["homepage", "about", "services", "contact", "faq"]
        
        for page_type in page_types:
            result = self.generate_page(
                content_type=page_type,
                company_name=company_name,
                services=services,
                address=address,
                phone=phone,
                email=email
            )
            results[page_type] = result
        
        return results


def main():
    """CLI entry point."""
    import argparse
    
    parser = argparse.ArgumentParser(description="OSGB Content Pipeline")
    parser.add_argument("--type", "-t", required=True, help="Content type: homepage, about, services, contact, faq, blog")
    parser.add_argument("--company", "-c", required=True, help="Company name")
    parser.add_argument("--services", "-s", help="Comma-separated services")
    parser.add_argument("--address", help="Company address")
    parser.add_argument("--phone", help="Phone number")
    parser.add_argument("--email", help="Email address")
    parser.add_argument("--topic", help="Blog topic (for blog type)")
    parser.add_argument("--output", "-o", help="Output file")
    
    args = parser.parse_args()
    
    services = args.services.split(",") if args.services else None
    
    pipeline = OSGBContentPipeline()
    
    result = pipeline.generate_page(
        content_type=args.type,
        company_name=args.company,
        services=services,
        address=args.address,
        phone=args.phone,
        email=args.email,
        topic=args.topic
    )
    
    print(f"\n{'='*60}")
    print(f"Status: {result.status}")
    print(f"Model: {result.model_used}")
    print(f"Review Score: {result.review_score}")
    print(f"{'='*60}\n")
    
    if result.status == "success":
        print(result.content)
        
        if args.output:
            with open(args.output, "w", encoding="utf-8") as f:
                f.write(result.content)
            print(f"\nSaved to {args.output}")
    else:
        print(f"Error: {result.error}")


if __name__ == "__main__":
    main()

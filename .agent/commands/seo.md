---
description: SEO audit and optimization command. Provides comprehensive SEO analysis, schema generation, and technical audits.
---

# /seo - SEO Optimization Suite

$ARGUMENTS

---

## Purpose

This command provides comprehensive SEO tools including audits, schema generation, sitemap creation, and technical analysis.

---

## Sub-commands

```
/seo audit           - Full SEO audit (content + technical)
/seo schema          - Generate Schema.org JSON-LD markup
/seo sitemap         - Generate or update sitemap.xml
/seo robots          - Generate robots.txt
/seo keywords <topic> - Keyword research and suggestions
/seo technical       - Technical SEO audit only
/seo local           - Local SEO optimization check
/seo geo             - AI citation optimization (GEO)
```

---

## Behavior

### /seo audit

Comprehensive SEO analysis:

1. **Technical SEO**
   - robots.txt validation
   - sitemap.xml check
   - Meta tags audit
   - Heading structure
   - Core Web Vitals

2. **Content SEO**
   - Title optimization
   - Meta descriptions
   - Image alt texts
   - Internal linking

3. **Schema Markup**
   - Structured data presence
   - Schema validation
   - Rich results eligibility

4. **Report**
   - Score out of 100
   - Issues by priority
   - Actionable recommendations

### /seo schema

Generate Schema.org structured data:

```
/seo schema organization    - Company/brand schema
/seo schema local-business  - LocalBusiness schema
/seo schema article         - Blog/news article schema
/seo schema product         - E-commerce product schema
/seo schema faq             - FAQ page schema
/seo schema howto           - Tutorial/guide schema
/seo schema breadcrumb      - Navigation breadcrumbs
```

### /seo sitemap

Generate or update XML sitemap:
- Auto-detect project type (Next.js, Astro, etc.)
- Extract all indexable routes
- Set priorities and change frequencies
- Output sitemap.xml

### /seo robots

Generate robots.txt:
- Project-aware disallow rules
- Sitemap reference
- Bot-specific rules
- Security considerations

### /seo technical

Technical SEO deep dive:
- Crawlability analysis
- Indexability checks
- Site architecture review
- Performance indicators
- Security (HTTPS, headers)

### /seo local

Local SEO optimization:
- NAP consistency check
- LocalBusiness schema
- Google Maps embed
- Contact page analysis
- Review management tips

### /seo geo

Generative Engine Optimization:
- AI citation readiness
- Structured data for AI
- Authority signals
- Content format analysis
- Citation optimization

---

## Output Format

### Audit Output
```
SEO AUDIT REPORT
======================================================================
Project: /path/to/project
Score: 78/100
======================================================================

TECHNICAL SEO
----------------------------------------------------------------------
  [OK] robots.txt present
  [OK] sitemap.xml valid
  [WARN] 3 pages missing meta description
  [WARN] 5 images missing alt text

CONTENT SEO
----------------------------------------------------------------------
  [OK] H1 tags present on all pages
  [WARN] Title tags need optimization

SCHEMA MARKUP
----------------------------------------------------------------------
  [OK] Organization schema found
  [MISSING] LocalBusiness schema

RECOMMENDATIONS
----------------------------------------------------------------------
1. Add meta descriptions to missing pages
2. Add alt text to all images
3. Implement LocalBusiness schema

======================================================================
```

### Schema Output
```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Company Name",
  ...
}
```

---

## Examples

```
/seo audit
/seo schema organization
/seo schema faq
/seo sitemap
/seo robots
/seo keywords "iş sağlığı güvenliği"
/seo technical
/seo local
/seo geo
```

---

## Related Scripts

| Script | Location |
|--------|----------|
| seo_checker.py | skills/seo-fundamentals/scripts/ |
| geo_checker.py | skills/geo-fundamentals/scripts/ |
| schema_generator.py | skills/seo-advanced/scripts/ |
| sitemap_generator.py | skills/seo-advanced/scripts/ |
| robots_generator.py | skills/seo-advanced/scripts/ |
| technical_seo_audit.py | skills/technical-seo/scripts/ |
| local_seo_checker.py | skills/local-seo/scripts/ |

---

## Key Principles

- **User-first**: Quality content over tricks
- **Technical foundation**: Crawlability enables ranking
- **Structured data**: Help search engines understand
- **Dual optimization**: SEO + GEO for AI visibility

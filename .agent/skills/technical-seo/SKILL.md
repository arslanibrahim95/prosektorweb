---
name: technical-seo
description: Technical SEO audit and optimization checklist.
allowed-tools: Read, Glob, Grep, Bash
---

# Technical SEO

> Comprehensive technical SEO checklist and audit framework.

---

## 1. Overview

Technical SEO ensures search engines can effectively crawl, index, and understand your website. This skill provides a systematic approach to technical optimization.

---

## 2. Content Map

| File | Purpose |
|------|---------|
| `scripts/technical_seo_audit.py` | Automated technical SEO audit |

---

## 3. Critical Checks

| Check | Impact | How to Verify |
|-------|--------|---------------|
| HTTPS | Ranking factor | Check certificate |
| Mobile-friendly | Ranking factor | Google Mobile Test |
| Core Web Vitals | Ranking factor | PageSpeed Insights |
| Crawl errors | Indexing | Search Console |
| Sitemap | Crawling | sitemap.xml exists |

---

## 4. Crawlability

### robots.txt
- [ ] Exists at /robots.txt
- [ ] Not blocking important pages
- [ ] Sitemap reference included
- [ ] No syntax errors

### XML Sitemap
- [ ] Exists at /sitemap.xml
- [ ] Contains all important pages
- [ ] No 404 URLs included
- [ ] Lastmod dates accurate
- [ ] Submitted to Search Console

### Crawl Budget
- [ ] No infinite scroll traps
- [ ] Pagination implemented correctly
- [ ] Redirect chains < 3 hops
- [ ] No duplicate URLs

---

## 5. Indexability

### Meta Robots
- [ ] Important pages: index, follow
- [ ] Admin/private pages: noindex
- [ ] Paginated pages: proper handling
- [ ] No accidental noindex

### Canonical Tags
- [ ] Present on all pages
- [ ] Self-referencing on unique pages
- [ ] Points to preferred version
- [ ] No conflicting canonicals

### Hreflang (Multilingual)
- [ ] Correct language codes
- [ ] Reciprocal links present
- [ ] x-default specified
- [ ] No hreflang errors

---

## 6. Site Architecture

### URL Structure
| Good | Bad |
|------|-----|
| /category/product-name | /p?id=123&cat=5 |
| /blog/seo-guide-2024 | /blog/post/12345 |
| /services/web-design | /services.php?s=1 |

### Internal Linking
- [ ] Flat hierarchy (3 clicks max)
- [ ] No orphan pages
- [ ] Logical link distribution
- [ ] Descriptive anchor text

### Navigation
- [ ] Clear main navigation
- [ ] Breadcrumb navigation
- [ ] HTML sitemap
- [ ] Footer links

---

## 7. Page Speed

### Core Web Vitals
| Metric | Good | Needs Work | Poor |
|--------|------|------------|------|
| LCP | < 2.5s | 2.5-4s | > 4s |
| INP | < 200ms | 200-500ms | > 500ms |
| CLS | < 0.1 | 0.1-0.25 | > 0.25 |

### Optimization Techniques
- [ ] Image optimization (WebP, lazy loading)
- [ ] CSS/JS minification
- [ ] Code splitting
- [ ] CDN usage
- [ ] Browser caching
- [ ] Compression (gzip/brotli)

---

## 8. Mobile Optimization

### Requirements
- [ ] Responsive design
- [ ] Touch-friendly targets (48px)
- [ ] Readable text without zoom
- [ ] No horizontal scroll
- [ ] Fast mobile load time
- [ ] Viewport meta tag

---

## 9. Security

### HTTPS
- [ ] Valid SSL certificate
- [ ] All resources over HTTPS
- [ ] HTTP redirects to HTTPS
- [ ] HSTS header enabled

### Security Headers
```
Strict-Transport-Security: max-age=31536000
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

---

## 10. Structured Data

### Common Types
| Type | Use Case |
|------|----------|
| Organization | Company info |
| LocalBusiness | Physical locations |
| Article | Blog posts |
| Product | E-commerce |
| FAQPage | FAQ sections |
| BreadcrumbList | Navigation |

### Validation
- Rich Results Test
- Schema.org Validator
- Search Console errors

---

## 11. Audit Workflow

```
1. Crawl site → Identify pages
2. Check technical fundamentals
3. Analyze crawl data
4. Prioritize issues
5. Fix blocking issues first
6. Re-crawl and verify
```

### Priority Order
1. Critical (blocking indexing)
2. High (ranking impact)
3. Medium (UX/performance)
4. Low (best practices)

---

> **Principle:** Technical SEO is the foundation. Without it, great content won't rank.

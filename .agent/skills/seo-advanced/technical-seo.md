# Technical SEO

> Technical optimization checklist for search engine visibility.

---

## 1. Crawlability

### robots.txt
```txt
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /private/

Sitemap: https://example.com/sitemap.xml
```

### XML Sitemap
- Include all indexable pages
- Exclude noindex pages
- Update on content changes
- Submit to Search Console

### Crawl Budget
| Do | Don't |
|----|-------|
| Remove thin content | Create parameter URLs |
| Fix redirect chains | Leave 404 errors |
| Use canonical tags | Duplicate content |
| Limit pagination depth | Infinite scroll without pagination |

---

## 2. Indexability

### Meta Robots
```html
<!-- Index and follow (default) -->
<meta name="robots" content="index, follow">

<!-- Don't index, but follow links -->
<meta name="robots" content="noindex, follow">

<!-- Index, but don't follow links -->
<meta name="robots" content="index, nofollow">
```

### Canonical Tags
```html
<link rel="canonical" href="https://example.com/page">
```

**When to Use:**
- Duplicate content
- URL parameters
- Mobile/desktop versions
- Paginated content

---

## 3. Site Architecture

### URL Structure
| Good | Bad |
|------|-----|
| `/products/shoes` | `/p?id=123` |
| `/blog/seo-guide` | `/blog/123456` |
| `/category/subcategory` | `/cat/sub/sub/sub/page` |

### Internal Linking
- Flat structure (3 clicks max)
- Descriptive anchor text
- Contextual relevance
- Avoid orphan pages

### Navigation
- Clear hierarchy
- Breadcrumb navigation
- HTML sitemap
- Footer links

---

## 4. Page Speed

### Core Web Vitals
| Metric | Good | Poor |
|--------|------|------|
| LCP | < 2.5s | > 4.0s |
| INP | < 200ms | > 500ms |
| CLS | < 0.1 | > 0.25 |

### Optimization Techniques
| Technique | Impact |
|-----------|--------|
| Image optimization | High |
| Code splitting | High |
| CDN usage | High |
| Browser caching | Medium |
| Minification | Medium |
| Lazy loading | Medium |

---

## 5. Mobile Optimization

### Mobile-First Requirements
- Responsive design
- Readable text (16px+)
- Tap targets (48x48px)
- No horizontal scroll
- Fast mobile load time

### Testing
- Google Mobile-Friendly Test
- Chrome DevTools device mode
- Real device testing

---

## 6. HTTPS & Security

### Requirements
- Valid SSL certificate
- HSTS enabled
- No mixed content
- Secure cookies

### Security Headers
```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Content-Security-Policy: default-src 'self'
```

---

## 7. International SEO

### Hreflang Implementation
```html
<link rel="alternate" hreflang="en" href="https://example.com/en/page">
<link rel="alternate" hreflang="tr" href="https://example.com/tr/page">
<link rel="alternate" hreflang="x-default" href="https://example.com/page">
```

### URL Structures
| Type | Example |
|------|---------|
| Subdirectory | example.com/tr/ |
| Subdomain | tr.example.com |
| ccTLD | example.com.tr |

---

## 8. Structured Data

### Required Properties
| Schema | Required |
|--------|----------|
| Article | headline, image, author, publisher, datePublished |
| Product | name, image, offers |
| LocalBusiness | name, address, telephone |
| FAQPage | mainEntity with Question/Answer |

---

## 9. Technical Audit Checklist

### Critical
- [ ] HTTPS enabled
- [ ] Mobile-friendly
- [ ] Core Web Vitals passing
- [ ] No critical crawl errors
- [ ] XML sitemap submitted

### High Priority
- [ ] Canonical tags correct
- [ ] robots.txt configured
- [ ] No duplicate content
- [ ] 301 redirects for moved pages
- [ ] Structured data valid

### Medium Priority
- [ ] Internal linking optimized
- [ ] Image alt texts present
- [ ] URL structure clean
- [ ] Page depth < 4 levels
- [ ] Hreflang (if multilingual)

---

> **Principle:** Technical SEO is the foundation. Content can only rank if it can be crawled and indexed.

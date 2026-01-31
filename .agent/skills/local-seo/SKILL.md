---
name: local-seo
description: Local SEO optimization for businesses with physical locations.
allowed-tools: Read, Glob, Grep, Bash
---

# Local SEO

> Optimization strategies for local business visibility.

---

## 1. Overview

Local SEO focuses on optimizing a business's online presence to appear in local search results. Critical for businesses serving specific geographic areas.

---

## 2. Content Map

| File | Purpose |
|------|---------|
| `nap-optimization.md` | NAP consistency guide |
| `scripts/local_seo_checker.py` | Local SEO audit script |

---

## 3. Local SEO Fundamentals

### Key Ranking Factors

| Factor | Weight | Elements |
|--------|--------|----------|
| Google Business Profile | High | Completeness, reviews, photos |
| NAP Consistency | High | Name, Address, Phone |
| Reviews | High | Quantity, quality, recency |
| Local Citations | Medium | Directory listings |
| On-Page Signals | Medium | Location keywords, schema |
| Proximity | Medium | Distance from searcher |

---

## 4. Google Business Profile

### Optimization Checklist

- [ ] Claim and verify listing
- [ ] Complete all information
- [ ] Add high-quality photos
- [ ] Select accurate categories
- [ ] Add business hours
- [ ] Enable messaging
- [ ] Post regular updates
- [ ] Respond to all reviews

### Categories
- Primary: Most relevant service
- Secondary: Additional services (up to 9)

---

## 5. Local Schema Markup

### LocalBusiness Schema
```json
{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Business Name",
  "image": "https://example.com/image.jpg",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "123 Main St",
    "addressLocality": "Istanbul",
    "addressRegion": "Istanbul",
    "postalCode": "34000",
    "addressCountry": "TR"
  },
  "geo": {
    "@type": "GeoCoordinates",
    "latitude": 41.0082,
    "longitude": 28.9784
  },
  "telephone": "+90-555-555-5555",
  "openingHoursSpecification": [...],
  "priceRange": "$$"
}
```

---

## 6. Local Keywords

### Keyword Patterns
| Pattern | Example |
|---------|---------|
| [Service] + [City] | "diş hekimi istanbul" |
| [Service] + yakınımda | "restaurant yakınımda" |
| En iyi + [Service] + [Area] | "en iyi kuaför kadıköy" |
| [Service] + [Neighborhood] | "eczane beşiktaş" |

### Content Strategy
- Create location pages for each area served
- Include local landmarks and references
- Add location-specific testimonials
- Embed Google Maps

---

## 7. Citation Building

### Priority Directories (Turkey)
| Platform | Type |
|----------|------|
| Google Business | Critical |
| Yandex Maps | High |
| Foursquare | Medium |
| Yelp | Medium |
| Yellow Pages TR | Medium |
| Industry-specific | Varies |

### NAP Format
Maintain consistent format:
```
Business Name
Street Address, District
City, Postal Code
Phone: +90-XXX-XXX-XXXX
```

---

## 8. Review Strategy

### Getting Reviews
- Ask satisfied customers
- Make it easy (QR codes, links)
- Follow up after service
- Incentivize (carefully, per guidelines)

### Responding to Reviews
| Type | Response Strategy |
|------|-------------------|
| Positive | Thank, be specific, invite return |
| Negative | Apologize, offer solution, take offline |
| Fake | Report, respond professionally |

---

## 9. Local Content Ideas

| Content Type | Purpose |
|--------------|---------|
| Location pages | Target [service] + [location] |
| Local guides | Build local authority |
| Event coverage | Local relevance |
| Community involvement | Trust signals |
| Local news | Freshness |

---

> **Principle:** Local SEO is about being the obvious choice for nearby searchers.

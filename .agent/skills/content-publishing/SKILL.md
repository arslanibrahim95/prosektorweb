---
name: content-publishing
description: Content publishing workflows and CMS integration guides.
allowed-tools: Read, Glob, Grep, Bash, Write
---

# Content Publishing

> Workflows and integrations for publishing content.

---

## 1. Overview

This skill covers:
- Content publishing workflows
- CMS integrations
- Multi-channel distribution
- Publication scheduling

---

## 2. Content Map

| File | Purpose |
|------|---------|
| `cms-integration.md` | CMS integration guides |
| `scripts/content_publisher.py` | Publishing automation |

---

## 3. Publishing Workflow

### Standard Flow

```
1. DRAFT
   └── Initial content creation

2. REVIEW
   ├── Editorial review
   ├── SEO check
   └── Quality check

3. OPTIMIZE
   ├── Readability
   ├── SEO enhancement
   └── Media optimization

4. STAGE
   ├── Preview deployment
   └── Final review

5. PUBLISH
   ├── Deploy to production
   └── Cache invalidation

6. DISTRIBUTE
   ├── Social sharing
   ├── Newsletter
   └── Syndication
```

---

## 4. Pre-Publish Checklist

### Content Quality
- [ ] Grammar and spelling checked
- [ ] Links verified
- [ ] Images optimized
- [ ] Mobile preview tested

### SEO
- [ ] Title optimized
- [ ] Meta description set
- [ ] Schema markup added
- [ ] Internal links included
- [ ] Image alt texts

### Technical
- [ ] Correct URL/slug
- [ ] Category/tags assigned
- [ ] Publication date set
- [ ] Author credited

---

## 5. CMS Integration

### Supported Platforms

| CMS | Method |
|-----|--------|
| WordPress | REST API, WP-CLI |
| Contentful | Management API |
| Sanity | Client SDK |
| Strapi | REST/GraphQL API |
| MDX (Static) | File-based |

---

## 6. Publication Formats

### By Platform

| Platform | Format | Considerations |
|----------|--------|----------------|
| Blog | Full article | SEO, readability |
| Social | Excerpt + link | Character limits |
| Newsletter | Summary | CTAs, formatting |
| LinkedIn | Article or post | Professional tone |

---

## 7. Scheduling Best Practices

### Optimal Times (General)

| Day | Time (Local) |
|-----|--------------|
| Tuesday-Thursday | 9-11 AM |
| Weekends | Lower engagement |

### Consistency

- Regular publishing schedule
- Content calendar
- Buffer of ready content

---

## 8. Post-Publish

### Verification
- [ ] Live URL works
- [ ] Rendering correct
- [ ] Social previews work
- [ ] Analytics tracking

### Distribution
- [ ] Social media shared
- [ ] Internal notification
- [ ] Newsletter queue
- [ ] Syndication partners

### Monitoring
- Track initial engagement
- Monitor comments
- Check search indexing

---

> **Principle:** Publishing is not the end—it's the beginning of content performance.

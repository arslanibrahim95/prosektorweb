---
name: content-creation
description: AI-assisted content creation principles and templates for blogs, landing pages, and product descriptions.
allowed-tools: Read, Glob, Grep, Write
---

# Content Creation

> Principles and templates for effective content creation.

---

## 1. Overview

This skill provides frameworks and templates for creating high-quality content including:
- Blog posts
- Landing pages
- Product descriptions
- FAQ sections
- Service pages

---

## 2. Content Map

| File | Purpose |
|------|---------|
| `blog-writing.md` | Blog post creation guide |
| `landing-pages.md` | Landing page anatomy |
| `product-descriptions.md` | E-commerce content |
| `templates/blog-post.md` | Blog post template |
| `templates/landing-page.md` | Landing page template |
| `templates/faq-section.md` | FAQ section template |
| `scripts/content_generator.py` | Content skeleton generator |

---

## 3. Content Creation Principles

### Quality Standards

| Principle | Application |
|-----------|-------------|
| **Value-first** | Every piece must provide clear value |
| **Audience-focused** | Write for the reader, not search engines |
| **Scannable** | Headers, bullets, short paragraphs |
| **Actionable** | Clear next steps for readers |
| **Authoritative** | Support claims with data/sources |

### Content Hierarchy

```
HOOK → PROBLEM → SOLUTION → PROOF → CTA
```

1. **Hook**: Grab attention in first sentence
2. **Problem**: Identify reader's pain point
3. **Solution**: Present your answer
4. **Proof**: Evidence, data, testimonials
5. **CTA**: Clear call-to-action

---

## 4. Content Types

### By Purpose

| Type | Goal | Format |
|------|------|--------|
| Blog Post | Educate, engage | Long-form, structured |
| Landing Page | Convert | Persuasive, focused |
| Product Description | Sell | Benefit-focused |
| FAQ | Support | Q&A format |
| Service Page | Inform, qualify | Feature + benefit |

### By Intent

| Intent | Content Type |
|--------|--------------|
| Informational | How-to, guide, tutorial |
| Commercial | Comparison, review |
| Transactional | Product, pricing |
| Navigational | About, contact |

---

## 5. Writing Guidelines

### Voice & Tone

| Element | Guideline |
|---------|-----------|
| Voice | Consistent brand personality |
| Tone | Adapt to content type |
| Language | Match audience level |
| Formality | Industry-appropriate |

### Structure

| Section | Purpose |
|---------|---------|
| Headline | Attract, promise value |
| Introduction | Hook, preview content |
| Body | Deliver value |
| Conclusion | Summarize, CTA |

### Formatting

- **Headers**: Clear hierarchy (H1 > H2 > H3)
- **Paragraphs**: 2-4 sentences max
- **Lists**: For multiple related points
- **Bold**: Emphasize key terms
- **Images**: Support text, break monotony

---

## 6. SEO Integration

Every piece of content should include:

- [ ] Target keyword in title
- [ ] Meta description (150-160 chars)
- [ ] Keywords in first 100 words
- [ ] Internal links (2-3 minimum)
- [ ] External links to authorities
- [ ] Image alt texts
- [ ] Schema markup where applicable

---

## 7. Quality Checklist

Before publishing:

- [ ] Provides clear value
- [ ] Matches search intent
- [ ] Free of errors
- [ ] Well-formatted
- [ ] Includes CTA
- [ ] SEO optimized
- [ ] Mobile-friendly layout
- [ ] Sources cited

---

## 8. Multi-Model Integration

This skill integrates with the multi-model content pipeline for AI-assisted generation.

### Model-Content Mapping

| Content Type | Recommended Model | Rationale |
|--------------|-------------------|-----------|
| Blog Post | Claude | Long-form, E-E-A-T, consistent tone |
| Service Page | Claude | Professional, authoritative |
| Landing Page | Gemini | Conversion-focused, structured |
| FAQ | Gemini | Q&A format, concise |
| Product Description | GLM 4.7 | Cost-effective, high volume |

### Pipeline Integration

```python
# Using content_pipeline.py
python scripts/content_pipeline.py generate \
  --type blog \
  --topic "Your topic here" \
  --context '{"language": "tr", "industry": "OSGB"}'
```

### Template Usage

Templates in `templates/` folder are loaded automatically by the pipeline:

1. Pipeline receives content_type
2. Looks for matching template in `templates/{content_type}.md`
3. Uses template structure in generation prompt
4. Generated content follows template format

### Review Integration

All AI-generated content goes through:

1. **Generation** → Multi-model connector
2. **Optimization** → content-optimization skill
3. **Review** → GPT-4 quality assessment (content-review skill)
4. **Revision** → If score < threshold, auto-revise
5. **Publish** → Format for CMS (content-publishing skill)

### Related Skills

| Skill | Purpose |
|-------|---------|
| multi-model-connector | AI model routing & generation |
| content-review | GPT-4 quality assessment |
| content-optimization | Readability & SEO enhancement |
| content-publishing | CMS formatting & distribution |

---

> **Principle:** Great content answers questions before they're asked.

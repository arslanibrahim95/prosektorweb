#!/usr/bin/env python3
"""
Script: content_generator.py
Purpose: Generate content skeletons for blogs, landing pages, products, FAQs
Usage: python content_generator.py <type> [--topic "topic"] [--output file.md]

Types: blog, landing, product, faq, service
"""

import sys
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    pass


# ============================================================================
#  TEMPLATES
# ============================================================================

BLOG_TEMPLATE = '''---
title: "{title}"
description: ""
author: ""
date: "{date}"
category: ""
tags: []
featured_image: ""
---

# {title}

[HOOK: Start with a compelling question, statistic, or statement]

[CONTEXT: Why this topic matters to your audience]

**In this guide, you'll learn:**
- Key point 1
- Key point 2
- Key point 3

---

## [First Main Section]

[Introduction to this section]

### [Subsection]

[Detailed content with examples]

**Key Points:**
- Point 1
- Point 2
- Point 3

---

## [Second Main Section]

[Content for this section]

| Comparison | Option A | Option B |
|------------|----------|----------|
| Feature 1 | Value | Value |
| Feature 2 | Value | Value |

---

## [Third Main Section]

[Continue with valuable content]

**Step-by-step:**
1. **Step 1:** Description
2. **Step 2:** Description
3. **Step 3:** Description

---

## Frequently Asked Questions

### [Common question about this topic]?

[Clear, concise answer]

### [Another relevant question]?

[Clear, concise answer]

---

## Conclusion

[Summarize key takeaways]

[Reinforce the value of what they learned]

**Next step:** [Clear call-to-action]

---

*Last updated: {date}*
'''

LANDING_TEMPLATE = '''# {title} - Landing Page

## Hero Section

### Headline
[Clear value proposition - what do they get?]

### Subheadline
[Expand on headline - how do they get it?]

### Primary CTA
[Button text: Action verb + benefit]

### Trust Indicators
- [Social proof number]
- [Rating/review]
- [Client logos]

---

## Problem Section

### Pain Point 1
[Icon] [Description of problem]

### Pain Point 2
[Icon] [Description of problem]

### Pain Point 3
[Icon] [Description of problem]

---

## Solution Section

### How It Works

**Step 1: [Action]**
[Brief description]

**Step 2: [Action]**
[Brief description]

**Step 3: [Action]**
[Brief description and outcome]

---

## Features & Benefits

### Feature 1
[Benefit-focused description]

### Feature 2
[Benefit-focused description]

### Feature 3
[Benefit-focused description]

---

## Social Proof

### Testimonial 1
> "[Specific result with numbers]"
>
> — Name, Title, Company

### Testimonial 2
> "[Quote about experience]"
>
> — Name, Title, Company

---

## FAQ Section

### [Question 1]?
[Answer]

### [Question 2]?
[Answer]

### [Question 3]?
[Answer]

---

## Final CTA

### Closing Headline
[Reinforce value or create urgency]

### CTA Button
[Same as primary CTA]

### Trust Reassurance
[Guarantee, security, easy cancellation]

---

## Metadata
- Title tag: [60 chars max]
- Meta description: [155 chars max]
- OG Image: [1200x630px]
'''

PRODUCT_TEMPLATE = '''# {title} - Product Page

## Product Information

**Product Name:** {title}
**SKU:**
**Price:**
**Availability:** In Stock

---

## Short Description

[50-100 word compelling overview]

**Key Features:**
- Feature 1
- Feature 2
- Feature 3

---

## Long Description

### The Problem
[What pain point does this solve?]

### The Solution
[How does this product address the need?]

### Key Benefits

**Benefit 1**
[Description with supporting feature]

**Benefit 2**
[Description with supporting feature]

**Benefit 3**
[Description with supporting feature]

### Who It's For
[Ideal customer description]

---

## Specifications

| Specification | Value |
|---------------|-------|
| Dimensions | |
| Weight | |
| Material | |
| Color Options | |
| Warranty | |

---

## What's Included

- Item 1
- Item 2
- Item 3

---

## Customer Reviews

### Review 1
⭐⭐⭐⭐⭐
> "[Review text]"
> — Customer Name

### Review 2
⭐⭐⭐⭐⭐
> "[Review text]"
> — Customer Name

---

## FAQ

### [Question about product]?
[Answer]

### [Question about shipping/returns]?
[Answer]

---

## Related Products

- [Related Product 1]
- [Related Product 2]
- [Related Product 3]

---

## SEO Metadata

- Title: {title} | [Brand] - [Key Feature]
- Description: [155 char product description with key benefit]
- Schema: Product
'''

FAQ_TEMPLATE = '''# {title} - FAQ Section

## FAQPage Schema

```json
{{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    // Add questions below
  ]
}}
```

---

## General Questions

### What is {topic}?

[Clear definition in 2-3 sentences]

---

### How does {topic} work?

[Step-by-step explanation]

1. First step
2. Second step
3. Third step

---

### Who is {topic} for?

[Target audience description]

- Audience segment 1
- Audience segment 2
- Audience segment 3

---

## Pricing Questions

### How much does it cost?

[Clear pricing information]

| Plan | Price | Features |
|------|-------|----------|
| Basic | | |
| Pro | | |

---

### Is there a free trial?

[Trial information]

---

## Technical Questions

### What are the requirements?

[System/requirements list]

---

### How do I get started?

[Getting started steps]

---

## Support Questions

### How do I contact support?

[Contact methods]
- Email:
- Phone:
- Chat:

---

### What is the response time?

[Response time expectations]

---

## Additional Questions

### [Add more relevant questions as needed]

[Answer]

---

*Last updated: {date}*
'''

SERVICE_TEMPLATE = '''# {title} - Service Page

## Service Overview

### What We Offer
[Clear description of the service]

### Who It's For
[Target audience]

### Key Benefits
- Benefit 1
- Benefit 2
- Benefit 3

---

## How It Works

### Step 1: [Phase Name]
[Description of first phase]

### Step 2: [Phase Name]
[Description of second phase]

### Step 3: [Phase Name]
[Description of third phase]

### Step 4: [Phase Name]
[Description of final phase/delivery]

---

## What's Included

### [Package/Tier Name]

**Includes:**
- Deliverable 1
- Deliverable 2
- Deliverable 3

**Timeline:** [Duration]
**Investment:** [Price or "Contact for quote"]

---

## Why Choose Us

### [Differentiator 1]
[Explanation]

### [Differentiator 2]
[Explanation]

### [Differentiator 3]
[Explanation]

---

## Case Studies / Results

### [Client/Project Name]

**Challenge:** [What they faced]

**Solution:** [What we did]

**Results:** [Measurable outcomes]

---

## Testimonials

> "[Quote about working with us]"
> — Name, Company

---

## FAQ

### How long does it take?
[Timeline explanation]

### What do you need from us?
[Client requirements]

### What's the process?
[Brief process overview]

---

## Get Started

### Ready to [achieve outcome]?

[CTA: Contact us / Schedule a call / Get a quote]

---

## Contact Information

- Email:
- Phone:
- Location:

---

## SEO Metadata

- Title: {title} | [Company Name]
- Description: [Service description with key benefit, 155 chars]
- Schema: Service, LocalBusiness (if applicable)
'''


# ============================================================================
#  MAIN
# ============================================================================

TEMPLATES = {
    "blog": BLOG_TEMPLATE,
    "landing": LANDING_TEMPLATE,
    "product": PRODUCT_TEMPLATE,
    "faq": FAQ_TEMPLATE,
    "service": SERVICE_TEMPLATE
}


def generate_content(content_type: str, topic: str) -> str:
    """Generate content skeleton."""
    template = TEMPLATES.get(content_type, BLOG_TEMPLATE)

    # Create title from topic
    title = topic.title() if topic else f"[{content_type.title()} Title]"

    return template.format(
        title=title,
        topic=topic or "[Topic]",
        date=datetime.now().strftime("%Y-%m-%d")
    )


def main():
    parser = argparse.ArgumentParser(
        description="Generate content skeletons for various content types"
    )
    parser.add_argument("type", choices=list(TEMPLATES.keys()),
                        help="Content type to generate")
    parser.add_argument("--topic", "-t", default="", help="Topic/title for the content")
    parser.add_argument("--output", "-o", help="Output file path")

    args = parser.parse_args()

    content = generate_content(args.type, args.topic)

    if args.output:
        output_path = Path(args.output)
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(content)
        print(f"Content skeleton saved to: {output_path}")
    else:
        print(content)


if __name__ == "__main__":
    main()

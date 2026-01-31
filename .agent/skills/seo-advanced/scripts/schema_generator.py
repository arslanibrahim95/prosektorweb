#!/usr/bin/env python3
"""
Script: schema_generator.py
Purpose: Generate Schema.org JSON-LD structured data
Usage: python schema_generator.py <type> [--output file.json] [--config config.json]

Types: organization, local-business, article, product, faq, howto, breadcrumb
"""

import json
import sys
import argparse
from datetime import datetime
from pathlib import Path
from typing import Dict, Any, Optional

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    pass


# ============================================================================
#  SCHEMA TEMPLATES
# ============================================================================

def organization_schema(config: Dict) -> Dict[str, Any]:
    """Generate Organization schema."""
    return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": config.get("name", "Company Name"),
        "url": config.get("url", "https://example.com"),
        "logo": config.get("logo", "https://example.com/logo.png"),
        "description": config.get("description", ""),
        "sameAs": config.get("social_links", []),
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": config.get("phone", ""),
            "contactType": "customer service",
            "availableLanguage": config.get("languages", ["Turkish", "English"])
        }
    }


def local_business_schema(config: Dict) -> Dict[str, Any]:
    """Generate LocalBusiness schema."""
    schema = {
        "@context": "https://schema.org",
        "@type": config.get("business_type", "LocalBusiness"),
        "name": config.get("name", "Business Name"),
        "image": config.get("image", ""),
        "telephone": config.get("phone", ""),
        "email": config.get("email", ""),
        "url": config.get("url", ""),
        "address": {
            "@type": "PostalAddress",
            "streetAddress": config.get("street", ""),
            "addressLocality": config.get("city", ""),
            "addressRegion": config.get("region", ""),
            "postalCode": config.get("postal_code", ""),
            "addressCountry": config.get("country", "TR")
        },
        "priceRange": config.get("price_range", "$$")
    }

    # Add geo coordinates if provided
    if config.get("latitude") and config.get("longitude"):
        schema["geo"] = {
            "@type": "GeoCoordinates",
            "latitude": config["latitude"],
            "longitude": config["longitude"]
        }

    # Add opening hours if provided
    if config.get("opening_hours"):
        schema["openingHoursSpecification"] = []
        for hours in config["opening_hours"]:
            schema["openingHoursSpecification"].append({
                "@type": "OpeningHoursSpecification",
                "dayOfWeek": hours.get("days", []),
                "opens": hours.get("opens", "09:00"),
                "closes": hours.get("closes", "18:00")
            })

    return schema


def article_schema(config: Dict) -> Dict[str, Any]:
    """Generate Article schema."""
    return {
        "@context": "https://schema.org",
        "@type": config.get("article_type", "Article"),
        "headline": config.get("title", "Article Title"),
        "description": config.get("description", ""),
        "image": config.get("image", ""),
        "author": {
            "@type": "Person",
            "name": config.get("author_name", ""),
            "url": config.get("author_url", "")
        },
        "publisher": {
            "@type": "Organization",
            "name": config.get("publisher_name", ""),
            "logo": {
                "@type": "ImageObject",
                "url": config.get("publisher_logo", "")
            }
        },
        "datePublished": config.get("date_published", datetime.now().strftime("%Y-%m-%d")),
        "dateModified": config.get("date_modified", datetime.now().strftime("%Y-%m-%d")),
        "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": config.get("url", "")
        }
    }


def product_schema(config: Dict) -> Dict[str, Any]:
    """Generate Product schema."""
    schema = {
        "@context": "https://schema.org",
        "@type": "Product",
        "name": config.get("name", "Product Name"),
        "image": config.get("image", ""),
        "description": config.get("description", ""),
        "brand": {
            "@type": "Brand",
            "name": config.get("brand", "")
        },
        "offers": {
            "@type": "Offer",
            "price": config.get("price", "0"),
            "priceCurrency": config.get("currency", "TRY"),
            "availability": f"https://schema.org/{config.get('availability', 'InStock')}",
            "url": config.get("url", "")
        }
    }

    # Add aggregate rating if provided
    if config.get("rating"):
        schema["aggregateRating"] = {
            "@type": "AggregateRating",
            "ratingValue": config["rating"].get("value", "0"),
            "reviewCount": config["rating"].get("count", "0")
        }

    return schema


def faq_schema(config: Dict) -> Dict[str, Any]:
    """Generate FAQPage schema."""
    questions = []
    for qa in config.get("questions", []):
        questions.append({
            "@type": "Question",
            "name": qa.get("question", ""),
            "acceptedAnswer": {
                "@type": "Answer",
                "text": qa.get("answer", "")
            }
        })

    return {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": questions
    }


def howto_schema(config: Dict) -> Dict[str, Any]:
    """Generate HowTo schema."""
    steps = []
    for i, step in enumerate(config.get("steps", []), 1):
        step_data = {
            "@type": "HowToStep",
            "position": i,
            "name": step.get("name", f"Step {i}"),
            "text": step.get("text", "")
        }
        if step.get("image"):
            step_data["image"] = step["image"]
        steps.append(step_data)

    return {
        "@context": "https://schema.org",
        "@type": "HowTo",
        "name": config.get("title", "How To Guide"),
        "description": config.get("description", ""),
        "totalTime": config.get("total_time", ""),
        "step": steps
    }


def breadcrumb_schema(config: Dict) -> Dict[str, Any]:
    """Generate BreadcrumbList schema."""
    items = []
    for i, item in enumerate(config.get("items", []), 1):
        item_data = {
            "@type": "ListItem",
            "position": i,
            "name": item.get("name", "")
        }
        if item.get("url"):
            item_data["item"] = item["url"]
        items.append(item_data)

    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": items
    }


# ============================================================================
#  MAIN
# ============================================================================

SCHEMA_GENERATORS = {
    "organization": organization_schema,
    "local-business": local_business_schema,
    "article": article_schema,
    "product": product_schema,
    "faq": faq_schema,
    "howto": howto_schema,
    "breadcrumb": breadcrumb_schema
}


def load_config(config_path: Optional[str]) -> Dict:
    """Load configuration from file."""
    if not config_path:
        return {}

    path = Path(config_path)
    if not path.exists():
        return {}

    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception:
        return {}


def main():
    parser = argparse.ArgumentParser(
        description="Generate Schema.org JSON-LD structured data"
    )
    parser.add_argument("type", choices=list(SCHEMA_GENERATORS.keys()),
                        help="Schema type to generate")
    parser.add_argument("--config", "-c", help="Path to config JSON file")
    parser.add_argument("--output", "-o", help="Output file path")
    parser.add_argument("--interactive", "-i", action="store_true",
                        help="Interactive mode (prompts for values)")

    args = parser.parse_args()

    # Load config
    config = load_config(args.config)

    # Interactive mode
    if args.interactive:
        print(f"\nGenerating {args.type} schema (press Enter for defaults)")
        print("-" * 50)

        if args.type == "organization":
            config["name"] = input("Company name: ") or config.get("name", "")
            config["url"] = input("Website URL: ") or config.get("url", "")
            config["phone"] = input("Phone: ") or config.get("phone", "")

        elif args.type == "article":
            config["title"] = input("Article title: ") or config.get("title", "")
            config["description"] = input("Description: ") or config.get("description", "")
            config["author_name"] = input("Author name: ") or config.get("author_name", "")

        elif args.type == "faq":
            config["questions"] = []
            print("\nEnter questions (empty question to finish):")
            while True:
                q = input("Question: ")
                if not q:
                    break
                a = input("Answer: ")
                config["questions"].append({"question": q, "answer": a})

    # Generate schema
    generator = SCHEMA_GENERATORS[args.type]
    schema = generator(config)

    # Output
    output_json = json.dumps(schema, indent=2, ensure_ascii=False)

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            f.write(output_json)
        print(f"Schema saved to: {args.output}")
    else:
        print(output_json)

    # Print HTML snippet
    print("\n" + "=" * 50)
    print("HTML Snippet:")
    print("=" * 50)
    print(f'<script type="application/ld+json">')
    print(output_json)
    print('</script>')


if __name__ == "__main__":
    main()

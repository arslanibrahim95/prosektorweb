#!/usr/bin/env python3
"""
Script: content_publisher.py
Purpose: Automate content publishing workflow
Usage: python content_publisher.py <action> [options]

Actions:
  prepare <file>      - Prepare content for publishing (validate, optimize)
  preview <file>      - Generate preview
  publish <file>      - Publish content (requires CMS config)
  distribute <file>   - Create distribution snippets
"""

import sys
import re
import json
import argparse
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    pass


# ============================================================================
#  CONTENT PREPARATION
# ============================================================================

def parse_frontmatter(content: str) -> tuple:
    """Parse YAML frontmatter from content."""
    if not content.startswith('---'):
        return {}, content

    parts = content.split('---', 2)
    if len(parts) < 3:
        return {}, content

    frontmatter = {}
    for line in parts[1].strip().split('\n'):
        if ':' in line:
            key, value = line.split(':', 1)
            value = value.strip().strip('"').strip("'")
            frontmatter[key.strip()] = value

    return frontmatter, parts[2].strip()


def validate_content(content: str, metadata: Dict) -> Dict[str, Any]:
    """Validate content is ready for publishing."""
    issues = []
    warnings = []

    # Required metadata
    required_fields = ['title', 'description']
    for field in required_fields:
        if field not in metadata or not metadata[field]:
            issues.append(f"Missing required field: {field}")

    # Title length
    title = metadata.get('title', '')
    if len(title) > 60:
        warnings.append(f"Title too long ({len(title)} chars, max 60)")

    # Description length
    desc = metadata.get('description', '')
    if desc and len(desc) > 160:
        warnings.append(f"Description too long ({len(desc)} chars, max 160)")

    # Content checks
    if len(content.split()) < 100:
        warnings.append("Content may be too short (< 100 words)")

    # Check for broken image references
    images = re.findall(r'!\[.*?\]\((.*?)\)', content)
    for img in images:
        if not img.startswith('http') and not Path(img).exists():
            warnings.append(f"Image may not exist: {img}")

    # Check for empty links
    empty_links = re.findall(r'\[.*?\]\(\s*\)', content)
    if empty_links:
        issues.append(f"Found {len(empty_links)} empty links")

    return {
        "valid": len(issues) == 0,
        "issues": issues,
        "warnings": warnings
    }


def prepare_content(file_path: Path) -> Dict[str, Any]:
    """Prepare content for publishing."""
    with open(file_path, 'r', encoding='utf-8') as f:
        raw_content = f.read()

    metadata, content = parse_frontmatter(raw_content)

    # Validation
    validation = validate_content(content, metadata)

    # Generate slug if not present
    if 'slug' not in metadata and 'title' in metadata:
        metadata['slug'] = metadata['title'].lower()
        metadata['slug'] = re.sub(r'[^a-z0-9]+', '-', metadata['slug']).strip('-')

    # Set publish date if not present
    if 'date' not in metadata:
        metadata['date'] = datetime.now().strftime('%Y-%m-%d')

    return {
        "file": str(file_path),
        "metadata": metadata,
        "content_length": len(content.split()),
        "validation": validation,
        "ready": validation["valid"]
    }


# ============================================================================
#  PREVIEW GENERATION
# ============================================================================

def generate_preview(file_path: Path) -> Dict[str, Any]:
    """Generate content preview."""
    with open(file_path, 'r', encoding='utf-8') as f:
        raw_content = f.read()

    metadata, content = parse_frontmatter(raw_content)

    # Extract first paragraph for excerpt
    paragraphs = [p.strip() for p in content.split('\n\n') if p.strip() and not p.strip().startswith('#')]
    excerpt = paragraphs[0][:200] + '...' if paragraphs else ''

    # Extract headings for TOC
    headings = re.findall(r'^(#{1,3})\s+(.+)$', content, re.MULTILINE)
    toc = [{"level": len(h[0]), "text": h[1]} for h in headings]

    return {
        "title": metadata.get('title', 'Untitled'),
        "description": metadata.get('description', ''),
        "excerpt": excerpt,
        "word_count": len(content.split()),
        "reading_time": max(1, len(content.split()) // 200),
        "table_of_contents": toc,
        "metadata": metadata
    }


# ============================================================================
#  DISTRIBUTION
# ============================================================================

def generate_social_snippets(file_path: Path, url: str = '') -> Dict[str, Any]:
    """Generate social media distribution snippets."""
    with open(file_path, 'r', encoding='utf-8') as f:
        raw_content = f.read()

    metadata, content = parse_frontmatter(raw_content)

    title = metadata.get('title', 'Untitled')
    description = metadata.get('description', '')

    # Extract key points (first 3 bullet points or sentences)
    bullets = re.findall(r'^\s*[-*]\s+(.+)$', content, re.MULTILINE)[:3]
    key_points = bullets if bullets else content.split('.')[:3]

    return {
        "twitter": {
            "text": f"{title}\n\n{description[:180]}\n\n{url}" if url else f"{title}\n\n{description[:200]}",
            "char_count": len(title) + len(description[:180]) + len(url) + 4
        },
        "linkedin": {
            "text": f"{title}\n\n{description}\n\nKey takeaways:\n" + "\n".join(f"• {p[:100]}" for p in key_points) + f"\n\nRead more: {url}" if url else "",
        },
        "newsletter": {
            "subject": title,
            "preview": description[:90] + "...",
            "body": f"# {title}\n\n{description}\n\n**Key Points:**\n" + "\n".join(f"- {p}" for p in key_points)
        },
        "metadata": {
            "og_title": title[:60],
            "og_description": description[:160],
            "twitter_title": title[:70],
            "twitter_description": description[:200]
        }
    }


# ============================================================================
#  MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Content Publishing Automation",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Actions:
  prepare     Validate and prepare content for publishing
  preview     Generate content preview (TOC, excerpt, reading time)
  distribute  Generate social media snippets
        """
    )
    parser.add_argument("action", choices=["prepare", "preview", "distribute"],
                        help="Action to perform")
    parser.add_argument("file", help="Content file path")
    parser.add_argument("--url", help="Published URL (for distribute)")
    parser.add_argument("--json", action="store_true", help="Output JSON only")
    parser.add_argument("--output", "-o", help="Output file")

    args = parser.parse_args()

    file_path = Path(args.file)
    if not file_path.exists():
        print(f"Error: File not found: {file_path}")
        sys.exit(1)

    # Execute action
    if args.action == "prepare":
        result = prepare_content(file_path)
    elif args.action == "preview":
        result = generate_preview(file_path)
    elif args.action == "distribute":
        result = generate_social_snippets(file_path, args.url or '')
    else:
        print(f"Unknown action: {args.action}")
        sys.exit(1)

    # Output
    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print(f"\n{'='*60}")
        print(f"[CONTENT PUBLISHER - {args.action.upper()}]")
        print(f"{'='*60}")
        print(f"File: {file_path}")

        if args.action == "prepare":
            print(f"\nReady to Publish: {'YES' if result['ready'] else 'NO'}")
            print(f"Word Count: {result['content_length']}")
            if result['validation']['issues']:
                print("\nISSUES (must fix):")
                for issue in result['validation']['issues']:
                    print(f"  - {issue}")
            if result['validation']['warnings']:
                print("\nWARNINGS:")
                for warn in result['validation']['warnings']:
                    print(f"  - {warn}")

        elif args.action == "preview":
            print(f"\nTitle: {result['title']}")
            print(f"Words: {result['word_count']}")
            print(f"Reading Time: {result['reading_time']} min")
            print(f"\nExcerpt:\n{result['excerpt']}")
            if result['table_of_contents']:
                print("\nTable of Contents:")
                for item in result['table_of_contents']:
                    indent = "  " * (item['level'] - 1)
                    print(f"{indent}- {item['text']}")

        elif args.action == "distribute":
            print("\n--- TWITTER ---")
            print(result['twitter']['text'])
            print(f"({result['twitter']['char_count']} chars)")

            print("\n--- LINKEDIN ---")
            print(result['linkedin']['text'][:500])

            print("\n--- NEWSLETTER ---")
            print(f"Subject: {result['newsletter']['subject']}")
            print(f"Preview: {result['newsletter']['preview']}")

        print(f"\n{'='*60}\n")

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(result, f, indent=2, ensure_ascii=False)
        print(f"Output saved to: {args.output}")


if __name__ == "__main__":
    main()

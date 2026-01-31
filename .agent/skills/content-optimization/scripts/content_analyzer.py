#!/usr/bin/env python3
"""
Script: content_analyzer.py
Purpose: Analyze content quality and provide scoring
Usage: python content_analyzer.py <file_or_directory> [--output report.json]
"""

import sys
import os
import re
import json
import argparse
from pathlib import Path
from typing import Dict, List, Any
from datetime import datetime

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    pass


CONTENT_EXTENSIONS = {'.md', '.mdx', '.html', '.txt'}


# ============================================================================
#  QUALITY CHECKS
# ============================================================================

def check_title_quality(content: str) -> Dict[str, Any]:
    """Check title/headline quality."""
    result = {
        "score": 0,
        "max_score": 20,
        "findings": []
    }

    # Find title
    title_match = re.search(r'^#\s+(.+)$', content, re.MULTILINE)
    if not title_match:
        title_match = re.search(r'title:\s*["\']?([^"\']+)["\']?', content)

    if not title_match:
        result["findings"].append("No title found")
        return result

    title = title_match.group(1).strip()
    title_len = len(title)

    # Length check
    if 30 <= title_len <= 60:
        result["score"] += 10
    elif 20 <= title_len <= 70:
        result["score"] += 5
        result["findings"].append(f"Title length ({title_len}) could be optimized (30-60 ideal)")
    else:
        result["findings"].append(f"Title length ({title_len}) is not optimal")

    # Power words check
    power_words = ['how', 'why', 'what', 'best', 'top', 'guide', 'tips', 'ways', 'step']
    if any(word in title.lower() for word in power_words):
        result["score"] += 5

    # Number check
    if re.search(r'\d+', title):
        result["score"] += 5

    return result


def check_structure_quality(content: str) -> Dict[str, Any]:
    """Check content structure quality."""
    result = {
        "score": 0,
        "max_score": 20,
        "findings": []
    }

    # H1 check
    h1_count = len(re.findall(r'^#\s+', content, re.MULTILINE))
    if h1_count == 1:
        result["score"] += 5
    elif h1_count == 0:
        result["findings"].append("Missing H1 heading")
    else:
        result["findings"].append(f"Multiple H1 headings ({h1_count})")

    # H2+ check
    h2_count = len(re.findall(r'^##\s+', content, re.MULTILINE))
    if h2_count >= 3:
        result["score"] += 5
    elif h2_count >= 1:
        result["score"] += 2
        result["findings"].append("Consider adding more subheadings")
    else:
        result["findings"].append("No subheadings found")

    # Lists check
    has_lists = bool(re.search(r'^\s*[-*+]\s+', content, re.MULTILINE))
    if has_lists:
        result["score"] += 5
    else:
        result["findings"].append("No bullet lists found")

    # Paragraphs check
    paragraphs = [p for p in content.split('\n\n') if p.strip() and not p.strip().startswith('#')]
    if len(paragraphs) >= 5:
        result["score"] += 5
    else:
        result["findings"].append("Content may be too short")

    return result


def check_depth_quality(content: str) -> Dict[str, Any]:
    """Check content depth and value."""
    result = {
        "score": 0,
        "max_score": 20,
        "findings": []
    }

    # Word count
    words = re.findall(r'\b[a-zA-Z]+\b', content)
    word_count = len(words)

    if word_count >= 1500:
        result["score"] += 10
    elif word_count >= 800:
        result["score"] += 7
    elif word_count >= 300:
        result["score"] += 3
    else:
        result["findings"].append(f"Content too short ({word_count} words)")

    # Examples/case studies
    example_patterns = ['example', 'case study', 'for instance', 'such as']
    has_examples = any(p in content.lower() for p in example_patterns)
    if has_examples:
        result["score"] += 5
    else:
        result["findings"].append("Consider adding examples")

    # Statistics/data
    has_stats = bool(re.search(r'\d+%|\d+\s*(percent|million|billion)', content, re.IGNORECASE))
    if has_stats:
        result["score"] += 5
    else:
        result["findings"].append("Consider adding statistics or data")

    return result


def check_engagement_quality(content: str) -> Dict[str, Any]:
    """Check engagement elements."""
    result = {
        "score": 0,
        "max_score": 20,
        "findings": []
    }

    # Questions (engagement)
    question_count = content.count('?')
    if question_count >= 3:
        result["score"] += 5
    elif question_count >= 1:
        result["score"] += 2

    # CTA presence
    cta_patterns = ['contact us', 'get started', 'learn more', 'sign up', 'subscribe',
                    'download', 'try', 'click here', 'next step']
    has_cta = any(p in content.lower() for p in cta_patterns)
    if has_cta:
        result["score"] += 5
    else:
        result["findings"].append("No clear call-to-action found")

    # Hook in intro (first 100 words should be engaging)
    first_100 = ' '.join(content.split()[:100]).lower()
    hook_indicators = ['you', 'your', 'how', 'why', 'what if', 'imagine', '?']
    has_hook = any(h in first_100 for h in hook_indicators)
    if has_hook:
        result["score"] += 5
    else:
        result["findings"].append("Introduction may lack a hook")

    # Images
    has_images = bool(re.search(r'!\[.*\]\(.*\)', content))
    if has_images:
        result["score"] += 5
    else:
        result["findings"].append("No images found")

    return result


def check_seo_basics(content: str) -> Dict[str, Any]:
    """Check basic SEO elements."""
    result = {
        "score": 0,
        "max_score": 20,
        "findings": []
    }

    # Meta description
    has_meta = 'description:' in content.lower() or 'meta' in content.lower()
    if has_meta:
        result["score"] += 5
    else:
        result["findings"].append("No meta description found")

    # Internal links
    links = re.findall(r'\[.*?\]\((.*?)\)', content)
    internal_links = [l for l in links if not l.startswith('http')]
    if len(internal_links) >= 2:
        result["score"] += 5
    elif len(internal_links) >= 1:
        result["score"] += 2
        result["findings"].append("Add more internal links")
    else:
        result["findings"].append("No internal links found")

    # External links
    external_links = [l for l in links if l.startswith('http')]
    if external_links:
        result["score"] += 5
    else:
        result["findings"].append("No external links/references")

    # Alt texts
    images = re.findall(r'!\[(.*?)\]\(.*?\)', content)
    images_without_alt = [i for i in images if not i.strip()]
    if images and not images_without_alt:
        result["score"] += 5
    elif images_without_alt:
        result["findings"].append(f"{len(images_without_alt)} images missing alt text")

    return result


# ============================================================================
#  MAIN
# ============================================================================

def analyze_file(file_path: Path) -> Dict[str, Any]:
    """Analyze a single content file."""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    checks = {
        "title": check_title_quality(content),
        "structure": check_structure_quality(content),
        "depth": check_depth_quality(content),
        "engagement": check_engagement_quality(content),
        "seo": check_seo_basics(content)
    }

    total_score = sum(c["score"] for c in checks.values())
    max_score = sum(c["max_score"] for c in checks.values())

    all_findings = []
    for check_name, check_result in checks.items():
        for finding in check_result["findings"]:
            all_findings.append(f"[{check_name.upper()}] {finding}")

    return {
        "file": str(file_path),
        "score": total_score,
        "max_score": max_score,
        "percentage": round(total_score / max_score * 100) if max_score > 0 else 0,
        "checks": checks,
        "findings": all_findings,
        "grade": get_grade(total_score / max_score * 100 if max_score > 0 else 0)
    }


def get_grade(percentage: float) -> str:
    """Convert percentage to letter grade."""
    if percentage >= 90:
        return "A"
    elif percentage >= 80:
        return "B"
    elif percentage >= 70:
        return "C"
    elif percentage >= 60:
        return "D"
    else:
        return "F"


def analyze_directory(dir_path: Path) -> List[Dict[str, Any]]:
    """Analyze all content files in a directory."""
    results = []

    for root, dirs, files in os.walk(dir_path):
        # Skip common non-content directories
        dirs[:] = [d for d in dirs if d not in {'node_modules', '.git', 'dist', 'build'}]

        for file in files:
            if Path(file).suffix.lower() in CONTENT_EXTENSIONS:
                file_path = Path(root) / file
                try:
                    result = analyze_file(file_path)
                    results.append(result)
                except Exception as e:
                    results.append({
                        "file": str(file_path),
                        "error": str(e)
                    })

    return results


def main():
    parser = argparse.ArgumentParser(description="Content Quality Analyzer")
    parser.add_argument("path", help="File or directory to analyze")
    parser.add_argument("--output", "-o", help="Output JSON file")
    parser.add_argument("--json", action="store_true", help="Output JSON only")

    args = parser.parse_args()

    path = Path(args.path)

    if not path.exists():
        print(f"Error: Path not found: {path}")
        sys.exit(1)

    if path.is_file():
        results = [analyze_file(path)]
    else:
        results = analyze_directory(path)

    if not results:
        print("No content files found")
        sys.exit(0)

    # Calculate summary
    valid_results = [r for r in results if "error" not in r]
    avg_score = sum(r["percentage"] for r in valid_results) / len(valid_results) if valid_results else 0

    report = {
        "timestamp": datetime.now().isoformat(),
        "path": str(path),
        "files_analyzed": len(results),
        "average_score": round(avg_score, 1),
        "results": results
    }

    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print(f"\n{'='*60}")
        print(f"[CONTENT QUALITY ANALYZER]")
        print(f"{'='*60}")
        print(f"Path: {path}")
        print(f"Files Analyzed: {len(results)}")
        print(f"Average Score: {avg_score:.1f}%")

        for result in results:
            print(f"\n{'-'*60}")
            if "error" in result:
                print(f"[ERROR] {result['file']}: {result['error']}")
            else:
                print(f"[{result['grade']}] {result['file']} - {result['percentage']}%")
                for finding in result["findings"][:5]:
                    print(f"    - {finding}")
                if len(result["findings"]) > 5:
                    print(f"    ... and {len(result['findings']) - 5} more")

        print(f"\n{'='*60}\n")

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"Report saved to: {args.output}")

    sys.exit(0 if avg_score >= 70 else 1)


if __name__ == "__main__":
    main()

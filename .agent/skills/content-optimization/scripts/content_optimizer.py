#!/usr/bin/env python3
"""
Script: content_optimizer.py
Purpose: Analyze content for readability and SEO optimization opportunities
Usage: python content_optimizer.py <file_path> [--output report.json]
"""

import sys
import re
import json
import argparse
from pathlib import Path
from typing import Dict, List, Any
from collections import Counter
import math

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    pass


# ============================================================================
#  ANALYSIS FUNCTIONS
# ============================================================================

def count_syllables(word: str) -> int:
    """Estimate syllable count for a word."""
    word = word.lower()
    if len(word) <= 3:
        return 1

    # Remove silent e
    if word.endswith('e'):
        word = word[:-1]

    # Count vowel groups
    vowels = 'aeiouy'
    count = 0
    prev_vowel = False

    for char in word:
        is_vowel = char in vowels
        if is_vowel and not prev_vowel:
            count += 1
        prev_vowel = is_vowel

    return max(1, count)


def extract_text(content: str) -> str:
    """Extract plain text from markdown/HTML content."""
    # Remove code blocks
    text = re.sub(r'```[\s\S]*?```', '', content)
    text = re.sub(r'`[^`]+`', '', text)

    # Remove HTML tags
    text = re.sub(r'<[^>]+>', '', text)

    # Remove markdown formatting
    text = re.sub(r'\[([^\]]+)\]\([^)]+\)', r'\1', text)  # Links
    text = re.sub(r'[*_]{1,2}([^*_]+)[*_]{1,2}', r'\1', text)  # Bold/italic
    text = re.sub(r'^#{1,6}\s+', '', text, flags=re.MULTILINE)  # Headers
    text = re.sub(r'^\s*[-*+]\s+', '', text, flags=re.MULTILINE)  # Lists
    text = re.sub(r'^\s*\d+\.\s+', '', text, flags=re.MULTILINE)  # Numbered lists
    text = re.sub(r'^>\s+', '', text, flags=re.MULTILINE)  # Blockquotes

    return text


def analyze_readability(text: str) -> Dict[str, Any]:
    """Analyze text readability."""
    # Split into sentences
    sentences = re.split(r'[.!?]+', text)
    sentences = [s.strip() for s in sentences if s.strip()]

    # Split into words
    words = re.findall(r'\b[a-zA-Z]+\b', text)

    if not words or not sentences:
        return {
            "flesch_score": 0,
            "flesch_grade": "N/A",
            "avg_sentence_length": 0,
            "avg_syllables_per_word": 0,
            "total_words": 0,
            "total_sentences": 0,
            "issues": ["Content too short to analyze"]
        }

    # Calculate metrics
    total_words = len(words)
    total_sentences = len(sentences)
    total_syllables = sum(count_syllables(w) for w in words)

    avg_sentence_length = total_words / total_sentences
    avg_syllables = total_syllables / total_words

    # Flesch Reading Ease
    flesch_score = 206.835 - (1.015 * avg_sentence_length) - (84.6 * avg_syllables)
    flesch_score = max(0, min(100, flesch_score))

    # Grade level
    if flesch_score >= 90:
        grade = "5th grade (Very Easy)"
    elif flesch_score >= 80:
        grade = "6th grade (Easy)"
    elif flesch_score >= 70:
        grade = "7th grade (Fairly Easy)"
    elif flesch_score >= 60:
        grade = "8-9th grade (Standard)"
    elif flesch_score >= 50:
        grade = "10-12th grade (Fairly Difficult)"
    elif flesch_score >= 30:
        grade = "College (Difficult)"
    else:
        grade = "Graduate (Very Difficult)"

    # Find issues
    issues = []

    if avg_sentence_length > 25:
        issues.append(f"Average sentence too long ({avg_sentence_length:.1f} words, target: <25)")

    if flesch_score < 60:
        issues.append(f"Content may be too difficult (Flesch: {flesch_score:.1f}, target: 60+)")

    # Find long sentences
    long_sentences = [s for s in sentences if len(s.split()) > 30]
    if long_sentences:
        issues.append(f"{len(long_sentences)} sentences over 30 words")

    return {
        "flesch_score": round(flesch_score, 1),
        "flesch_grade": grade,
        "avg_sentence_length": round(avg_sentence_length, 1),
        "avg_syllables_per_word": round(avg_syllables, 2),
        "total_words": total_words,
        "total_sentences": total_sentences,
        "long_sentences": len(long_sentences),
        "issues": issues
    }


def analyze_structure(content: str) -> Dict[str, Any]:
    """Analyze content structure."""
    results = {
        "has_h1": False,
        "h1_count": 0,
        "heading_count": 0,
        "heading_hierarchy_valid": True,
        "has_lists": False,
        "has_tables": False,
        "has_images": False,
        "has_links": False,
        "paragraph_count": 0,
        "issues": []
    }

    # Count headings
    h1_matches = re.findall(r'^#\s+.+$', content, re.MULTILINE)
    h2_matches = re.findall(r'^##\s+.+$', content, re.MULTILINE)
    h3_matches = re.findall(r'^###\s+.+$', content, re.MULTILINE)

    results["h1_count"] = len(h1_matches)
    results["has_h1"] = len(h1_matches) > 0
    results["heading_count"] = len(h1_matches) + len(h2_matches) + len(h3_matches)

    if len(h1_matches) > 1:
        results["issues"].append(f"Multiple H1 tags found ({len(h1_matches)})")
        results["heading_hierarchy_valid"] = False

    if len(h1_matches) == 0:
        results["issues"].append("No H1 tag found")

    # Check for other elements
    results["has_lists"] = bool(re.search(r'^\s*[-*+]\s+', content, re.MULTILINE))
    results["has_tables"] = bool(re.search(r'\|.*\|', content))
    results["has_images"] = bool(re.search(r'!\[.*\]\(.*\)', content))
    results["has_links"] = bool(re.search(r'\[.*\]\(.*\)', content))

    # Count paragraphs
    paragraphs = re.split(r'\n\n+', content)
    paragraphs = [p for p in paragraphs if p.strip() and not p.strip().startswith('#')]
    results["paragraph_count"] = len(paragraphs)

    # Structure recommendations
    if not results["has_lists"]:
        results["issues"].append("Consider adding bullet points for scannability")

    if results["heading_count"] < 3:
        results["issues"].append("Consider adding more section headers")

    return results


def analyze_seo(content: str, keyword: str = None) -> Dict[str, Any]:
    """Analyze content for SEO factors."""
    text = extract_text(content).lower()
    results = {
        "word_count": len(text.split()),
        "has_meta_description": False,
        "has_title": False,
        "keyword_analysis": None,
        "internal_links": 0,
        "external_links": 0,
        "images_with_alt": 0,
        "images_without_alt": 0,
        "issues": []
    }

    # Check for frontmatter
    if re.search(r'^---\s*\n', content):
        if re.search(r'description:', content):
            results["has_meta_description"] = True
        if re.search(r'title:', content):
            results["has_title"] = True

    # Link analysis
    links = re.findall(r'\[.*?\]\((.*?)\)', content)
    for link in links:
        if link.startswith('http'):
            results["external_links"] += 1
        else:
            results["internal_links"] += 1

    # Image analysis
    images = re.findall(r'!\[(.*?)\]\(.*?\)', content)
    for alt in images:
        if alt.strip():
            results["images_with_alt"] += 1
        else:
            results["images_without_alt"] += 1

    # Keyword analysis
    if keyword:
        keyword_lower = keyword.lower()
        keyword_count = text.count(keyword_lower)
        word_count = len(text.split())
        density = (keyword_count / word_count * 100) if word_count > 0 else 0

        results["keyword_analysis"] = {
            "keyword": keyword,
            "count": keyword_count,
            "density": round(density, 2),
            "in_first_100_words": keyword_lower in ' '.join(text.split()[:100])
        }

        if keyword_count == 0:
            results["issues"].append(f"Keyword '{keyword}' not found in content")
        elif density > 3:
            results["issues"].append(f"Keyword density too high ({density:.1f}%), risk of keyword stuffing")

    # SEO recommendations
    if results["word_count"] < 300:
        results["issues"].append(f"Content too short ({results['word_count']} words, minimum: 300)")

    if results["internal_links"] == 0:
        results["issues"].append("No internal links found")

    if results["images_without_alt"] > 0:
        results["issues"].append(f"{results['images_without_alt']} images missing alt text")

    return results


def calculate_score(readability: Dict, structure: Dict, seo: Dict) -> int:
    """Calculate overall content score."""
    score = 100

    # Readability (40 points)
    flesch = readability.get("flesch_score", 0)
    if flesch >= 60:
        score -= 0
    elif flesch >= 50:
        score -= 10
    elif flesch >= 40:
        score -= 20
    else:
        score -= 30

    if readability.get("avg_sentence_length", 0) > 25:
        score -= 10

    # Structure (30 points)
    if not structure.get("has_h1"):
        score -= 10
    if structure.get("h1_count", 0) > 1:
        score -= 5
    if not structure.get("has_lists"):
        score -= 5
    if structure.get("heading_count", 0) < 3:
        score -= 10

    # SEO (30 points)
    if seo.get("word_count", 0) < 300:
        score -= 10
    if seo.get("internal_links", 0) == 0:
        score -= 10
    if seo.get("images_without_alt", 0) > 0:
        score -= 5
    if seo.get("keyword_analysis") and seo["keyword_analysis"]["count"] == 0:
        score -= 5

    return max(0, score)


# ============================================================================
#  MAIN
# ============================================================================

def analyze_content(file_path: Path, keyword: str = None) -> Dict[str, Any]:
    """Run full content analysis."""
    with open(file_path, 'r', encoding='utf-8', errors='ignore') as f:
        content = f.read()

    text = extract_text(content)

    report = {
        "file": str(file_path),
        "readability": analyze_readability(text),
        "structure": analyze_structure(content),
        "seo": analyze_seo(content, keyword),
        "recommendations": []
    }

    report["score"] = calculate_score(
        report["readability"],
        report["structure"],
        report["seo"]
    )

    # Compile recommendations
    all_issues = (
        report["readability"].get("issues", []) +
        report["structure"].get("issues", []) +
        report["seo"].get("issues", [])
    )
    report["recommendations"] = all_issues

    return report


def main():
    parser = argparse.ArgumentParser(description="Content Optimization Analyzer")
    parser.add_argument("file_path", help="Path to content file")
    parser.add_argument("--keyword", "-k", help="Target keyword to check")
    parser.add_argument("--output", "-o", help="Output JSON file")
    parser.add_argument("--json", action="store_true", help="Output JSON only")

    args = parser.parse_args()

    file_path = Path(args.file_path)
    if not file_path.exists():
        print(f"Error: File not found: {file_path}")
        sys.exit(1)

    report = analyze_content(file_path, args.keyword)

    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print(f"\n{'='*60}")
        print(f"[CONTENT OPTIMIZER]")
        print(f"{'='*60}")
        print(f"File: {file_path}")
        print(f"Score: {report['score']}/100")

        print(f"\n{'-'*60}")
        print("READABILITY")
        print(f"  Flesch Score: {report['readability']['flesch_score']}")
        print(f"  Grade Level: {report['readability']['flesch_grade']}")
        print(f"  Avg Sentence: {report['readability']['avg_sentence_length']} words")
        print(f"  Total Words: {report['readability']['total_words']}")

        print(f"\n{'-'*60}")
        print("STRUCTURE")
        print(f"  H1 Tag: {'Yes' if report['structure']['has_h1'] else 'No'}")
        print(f"  Headings: {report['structure']['heading_count']}")
        print(f"  Lists: {'Yes' if report['structure']['has_lists'] else 'No'}")
        print(f"  Images: {'Yes' if report['structure']['has_images'] else 'No'}")

        print(f"\n{'-'*60}")
        print("SEO")
        print(f"  Word Count: {report['seo']['word_count']}")
        print(f"  Internal Links: {report['seo']['internal_links']}")
        print(f"  External Links: {report['seo']['external_links']}")
        if report['seo']['keyword_analysis']:
            ka = report['seo']['keyword_analysis']
            print(f"  Keyword '{ka['keyword']}': {ka['count']} times ({ka['density']}%)")

        if report["recommendations"]:
            print(f"\n{'-'*60}")
            print("RECOMMENDATIONS")
            for rec in report["recommendations"]:
                print(f"  - {rec}")

        print(f"\n{'='*60}\n")

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"Report saved to: {args.output}")

    sys.exit(0 if report["score"] >= 70 else 1)


if __name__ == "__main__":
    main()

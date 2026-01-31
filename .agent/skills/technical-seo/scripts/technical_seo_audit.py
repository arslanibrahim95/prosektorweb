#!/usr/bin/env python3
"""
Script: technical_seo_audit.py
Purpose: Comprehensive technical SEO audit
Usage: python technical_seo_audit.py <project_path> [--output report.json]
"""

import os
import sys
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


SKIP_DIRS = {'node_modules', '.git', 'dist', 'build', '__pycache__', '.next', '.venv'}
PAGE_EXTENSIONS = {'.html', '.tsx', '.jsx', '.astro', '.md', '.mdx'}


# ============================================================================
#  CHECKS
# ============================================================================

def check_robots_txt(project_path: Path) -> Dict[str, Any]:
    """Check robots.txt file."""
    result = {
        "exists": False,
        "has_sitemap": False,
        "issues": [],
        "content_preview": ""
    }

    # Check public folder first (Next.js, etc.)
    robots_paths = [
        project_path / "public" / "robots.txt",
        project_path / "robots.txt"
    ]

    for robots_path in robots_paths:
        if robots_path.exists():
            result["exists"] = True
            try:
                with open(robots_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    result["content_preview"] = content[:500]

                    if "sitemap:" in content.lower():
                        result["has_sitemap"] = True
                    else:
                        result["issues"].append("No Sitemap reference in robots.txt")

                    if "disallow: /" in content.lower() and "user-agent: *" in content.lower():
                        # Check if it's blocking everything
                        lines = content.lower().split('\n')
                        for i, line in enumerate(lines):
                            if "user-agent: *" in line:
                                if i + 1 < len(lines) and "disallow: /" == lines[i + 1].strip():
                                    result["issues"].append("robots.txt may be blocking all crawlers")
                    break
            except Exception as e:
                result["issues"].append(f"Error reading robots.txt: {e}")

    if not result["exists"]:
        result["issues"].append("robots.txt not found")

    return result


def check_sitemap(project_path: Path) -> Dict[str, Any]:
    """Check sitemap.xml file."""
    result = {
        "exists": False,
        "url_count": 0,
        "has_lastmod": False,
        "issues": []
    }

    sitemap_paths = [
        project_path / "public" / "sitemap.xml",
        project_path / "sitemap.xml"
    ]

    for sitemap_path in sitemap_paths:
        if sitemap_path.exists():
            result["exists"] = True
            try:
                with open(sitemap_path, 'r', encoding='utf-8') as f:
                    content = f.read()

                    url_count = len(re.findall(r'<url>', content))
                    result["url_count"] = url_count

                    if '<lastmod>' in content:
                        result["has_lastmod"] = True
                    else:
                        result["issues"].append("Sitemap missing lastmod dates")

                    if url_count == 0:
                        result["issues"].append("Sitemap has no URLs")

                    break
            except Exception as e:
                result["issues"].append(f"Error reading sitemap: {e}")

    if not result["exists"]:
        result["issues"].append("sitemap.xml not found")

    return result


def check_meta_tags(project_path: Path) -> Dict[str, Any]:
    """Check meta tags across pages."""
    result = {
        "pages_checked": 0,
        "pages_with_title": 0,
        "pages_with_description": 0,
        "pages_with_viewport": 0,
        "pages_with_canonical": 0,
        "issues": []
    }

    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for file in files:
            if Path(file).suffix not in PAGE_EXTENSIONS:
                continue

            filepath = Path(root) / file
            result["pages_checked"] += 1

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                    if '<title' in content or 'title:' in content or 'title=' in content:
                        result["pages_with_title"] += 1

                    if 'meta' in content and 'description' in content:
                        result["pages_with_description"] += 1

                    if 'viewport' in content:
                        result["pages_with_viewport"] += 1

                    if 'canonical' in content:
                        result["pages_with_canonical"] += 1

            except Exception:
                pass

    if result["pages_checked"] > 0:
        if result["pages_with_viewport"] < result["pages_checked"]:
            result["issues"].append("Some pages missing viewport meta tag")

    return result


def check_headings(project_path: Path) -> Dict[str, Any]:
    """Check heading structure."""
    result = {
        "pages_with_h1": 0,
        "pages_with_multiple_h1": 0,
        "pages_checked": 0,
        "issues": []
    }

    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for file in files:
            if Path(file).suffix not in PAGE_EXTENSIONS:
                continue

            filepath = Path(root) / file
            result["pages_checked"] += 1

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                    h1_count = len(re.findall(r'<h1[^>]*>', content, re.IGNORECASE))
                    if h1_count > 0:
                        result["pages_with_h1"] += 1
                    if h1_count > 1:
                        result["pages_with_multiple_h1"] += 1

            except Exception:
                pass

    if result["pages_with_multiple_h1"] > 0:
        result["issues"].append(f"{result['pages_with_multiple_h1']} pages have multiple H1 tags")

    return result


def check_images(project_path: Path) -> Dict[str, Any]:
    """Check image optimization."""
    result = {
        "total_images": 0,
        "images_with_alt": 0,
        "webp_images": 0,
        "lazy_loading": 0,
        "issues": []
    }

    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for file in files:
            if Path(file).suffix not in PAGE_EXTENSIONS:
                continue

            filepath = Path(root) / file

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                    # Find all img tags
                    img_tags = re.findall(r'<img[^>]*>', content, re.IGNORECASE)
                    result["total_images"] += len(img_tags)

                    for img in img_tags:
                        if 'alt=' in img.lower():
                            result["images_with_alt"] += 1
                        if 'loading="lazy"' in img.lower() or "loading='lazy'" in img.lower():
                            result["lazy_loading"] += 1
                        if '.webp' in img.lower():
                            result["webp_images"] += 1

            except Exception:
                pass

    if result["total_images"] > 0:
        if result["images_with_alt"] < result["total_images"]:
            missing = result["total_images"] - result["images_with_alt"]
            result["issues"].append(f"{missing} images missing alt text")

    return result


def check_links(project_path: Path) -> Dict[str, Any]:
    """Check internal linking."""
    result = {
        "total_links": 0,
        "internal_links": 0,
        "external_links": 0,
        "links_with_nofollow": 0,
        "issues": []
    }

    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for file in files:
            if Path(file).suffix not in PAGE_EXTENSIONS:
                continue

            filepath = Path(root) / file

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                    # Find all anchor tags
                    links = re.findall(r'<a[^>]*href=["\']([^"\']+)["\'][^>]*>', content, re.IGNORECASE)
                    result["total_links"] += len(links)

                    for link in links:
                        if link.startswith('http'):
                            result["external_links"] += 1
                        else:
                            result["internal_links"] += 1

                    nofollow = len(re.findall(r'rel=["\'][^"\']*nofollow', content, re.IGNORECASE))
                    result["links_with_nofollow"] += nofollow

            except Exception:
                pass

    return result


def check_schema_markup(project_path: Path) -> Dict[str, Any]:
    """Check for structured data."""
    result = {
        "has_json_ld": False,
        "schema_types": [],
        "issues": []
    }

    schema_types_found = set()

    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for file in files:
            if Path(file).suffix not in PAGE_EXTENSIONS:
                continue

            filepath = Path(root) / file

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                    if 'application/ld+json' in content:
                        result["has_json_ld"] = True

                    types = re.findall(r'"@type"\s*:\s*"([^"]+)"', content)
                    schema_types_found.update(types)

            except Exception:
                pass

    result["schema_types"] = list(schema_types_found)

    if not result["has_json_ld"]:
        result["issues"].append("No JSON-LD structured data found")

    return result


def check_security(project_path: Path) -> Dict[str, Any]:
    """Check security-related SEO factors."""
    result = {
        "has_https_references": False,
        "has_mixed_content_risk": False,
        "issues": []
    }

    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for file in files:
            if Path(file).suffix not in PAGE_EXTENSIONS:
                continue

            filepath = Path(root) / file

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()

                    if 'https://' in content:
                        result["has_https_references"] = True

                    # Check for http:// in resources (potential mixed content)
                    http_resources = re.findall(r'(src|href)=["\']http://[^"\']+["\']', content, re.IGNORECASE)
                    if http_resources:
                        result["has_mixed_content_risk"] = True

            except Exception:
                pass

    if result["has_mixed_content_risk"]:
        result["issues"].append("Potential mixed content (HTTP resources on HTTPS page)")

    return result


# ============================================================================
#  MAIN
# ============================================================================

def run_audit(project_path: Path) -> Dict[str, Any]:
    """Run full technical SEO audit."""
    report = {
        "project": str(project_path),
        "timestamp": datetime.now().isoformat(),
        "checks": {},
        "summary": {
            "total_issues": 0,
            "critical": 0,
            "warnings": 0,
            "passed": 0
        },
        "score": 100
    }

    # Run all checks
    checks = [
        ("robots_txt", check_robots_txt),
        ("sitemap", check_sitemap),
        ("meta_tags", check_meta_tags),
        ("headings", check_headings),
        ("images", check_images),
        ("links", check_links),
        ("schema", check_schema_markup),
        ("security", check_security)
    ]

    for name, check_func in checks:
        result = check_func(project_path)
        report["checks"][name] = result

        issues = result.get("issues", [])
        report["summary"]["total_issues"] += len(issues)

        if not issues:
            report["summary"]["passed"] += 1
        else:
            report["summary"]["warnings"] += len(issues)

    # Calculate score
    deductions = report["summary"]["total_issues"] * 5
    report["score"] = max(0, 100 - deductions)

    return report


def main():
    parser = argparse.ArgumentParser(description="Technical SEO Audit")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    parser.add_argument("--output", "-o", help="Output JSON file")
    parser.add_argument("--json", action="store_true", help="Output JSON only")

    args = parser.parse_args()

    project_path = Path(args.project_path).resolve()

    if not project_path.is_dir():
        print(f"Error: Not a directory: {project_path}")
        sys.exit(1)

    report = run_audit(project_path)

    if args.json:
        print(json.dumps(report, indent=2, ensure_ascii=False))
    else:
        print(f"\n{'='*60}")
        print(f"[TECHNICAL SEO AUDIT]")
        print(f"{'='*60}")
        print(f"Project: {project_path}")
        print(f"Score: {report['score']}/100")
        print(f"\n{'-'*60}")

        for check_name, check_result in report["checks"].items():
            issues = check_result.get("issues", [])
            status = "[OK]" if not issues else "[WARN]"
            print(f"\n{status} {check_name.upper().replace('_', ' ')}")

            for issue in issues:
                print(f"    - {issue}")

        print(f"\n{'='*60}")
        print(f"SUMMARY")
        print(f"{'='*60}")
        print(f"Total Issues: {report['summary']['total_issues']}")
        print(f"Checks Passed: {report['summary']['passed']}")
        print(f"Score: {report['score']}/100")
        print(f"{'='*60}\n")

    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        print(f"Report saved to: {args.output}")

    sys.exit(0 if report["score"] >= 70 else 1)


if __name__ == "__main__":
    main()

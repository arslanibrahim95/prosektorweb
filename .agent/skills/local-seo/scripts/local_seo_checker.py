#!/usr/bin/env python3
"""
Script: local_seo_checker.py
Purpose: Audit local SEO elements on a website
Usage: python local_seo_checker.py <project_path> [--output report.json]
"""

import os
import sys
import re
import json
import argparse
from pathlib import Path
from typing import Dict, List, Any

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    pass


# ============================================================================
#  PATTERNS
# ============================================================================

# Phone patterns (Turkish format)
PHONE_PATTERNS = [
    r'\+90[\s\-]?\d{3}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}',
    r'\(0\d{3}\)[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}',
    r'0\d{3}[\s\-]?\d{3}[\s\-]?\d{2}[\s\-]?\d{2}',
]

# Address patterns
ADDRESS_PATTERNS = [
    r'(?:Cad(?:desi)?|Sok(?:ak)?|Bulvar[ıi]?|Mah(?:allesi)?)\s*(?:No)?[:.\s]*\d+',
    r'\d{5}\s+(?:Turkey|Türkiye|TR)',
    r'(?:Istanbul|Ankara|Izmir|İstanbul|İzmir)[,\s]+\d{5}',
]

# Schema patterns
SCHEMA_PATTERNS = {
    "LocalBusiness": r'"@type"\s*:\s*"LocalBusiness"',
    "Organization": r'"@type"\s*:\s*"Organization"',
    "PostalAddress": r'"@type"\s*:\s*"PostalAddress"',
    "GeoCoordinates": r'"@type"\s*:\s*"GeoCoordinates"',
    "OpeningHours": r'"openingHoursSpecification"',
}

# NAP elements to check
NAP_ELEMENTS = {
    "business_name": r'<(?:span|div|p)[^>]*itemprop=["\']name["\'][^>]*>([^<]+)<',
    "street": r'<(?:span|div)[^>]*itemprop=["\']streetAddress["\'][^>]*>([^<]+)<',
    "city": r'<(?:span|div)[^>]*itemprop=["\']addressLocality["\'][^>]*>([^<]+)<',
    "phone": r'<(?:span|a)[^>]*itemprop=["\']telephone["\'][^>]*>([^<]+)<',
}

SKIP_DIRS = {'node_modules', '.git', 'dist', 'build', '__pycache__', '.next', '.venv'}
PAGE_EXTENSIONS = {'.html', '.tsx', '.jsx', '.astro', '.md', '.mdx'}


# ============================================================================
#  CHECKING FUNCTIONS
# ============================================================================

def find_phone_numbers(content: str) -> List[str]:
    """Find phone numbers in content."""
    phones = []
    for pattern in PHONE_PATTERNS:
        matches = re.findall(pattern, content)
        phones.extend(matches)
    return list(set(phones))


def find_addresses(content: str) -> List[str]:
    """Find address patterns in content."""
    addresses = []
    for pattern in ADDRESS_PATTERNS:
        matches = re.findall(pattern, content, re.IGNORECASE)
        addresses.extend(matches)
    return list(set(addresses))


def check_schema_markup(content: str) -> Dict[str, bool]:
    """Check for schema markup presence."""
    results = {}
    for schema_type, pattern in SCHEMA_PATTERNS.items():
        results[schema_type] = bool(re.search(pattern, content))
    return results


def check_nap_markup(content: str) -> Dict[str, List[str]]:
    """Check for NAP microdata/schema markup."""
    results = {}
    for element, pattern in NAP_ELEMENTS.items():
        matches = re.findall(pattern, content, re.IGNORECASE)
        results[element] = matches
    return results


def check_google_maps(content: str) -> Dict[str, Any]:
    """Check for Google Maps embed."""
    results = {
        "has_iframe_map": bool(re.search(r'<iframe[^>]*google\.com/maps', content, re.IGNORECASE)),
        "has_maps_api": bool(re.search(r'maps\.googleapis\.com', content)),
        "has_place_id": bool(re.search(r'place_id=', content)),
    }
    return results


def check_contact_page(project_path: Path) -> Dict[str, Any]:
    """Check for contact page and its elements."""
    results = {
        "has_contact_page": False,
        "contact_files": [],
        "elements_found": {}
    }

    contact_patterns = ['contact', 'iletisim', 'iletişim', 'bize-ulasin', 'bize-ulaşın']

    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for file in files:
            if Path(file).suffix not in PAGE_EXTENSIONS:
                continue

            file_lower = file.lower()
            if any(pattern in file_lower for pattern in contact_patterns):
                results["has_contact_page"] = True
                results["contact_files"].append(str(Path(root) / file))

    return results


def scan_project(project_path: Path) -> Dict[str, Any]:
    """Scan project for local SEO elements."""
    results = {
        "phones_found": [],
        "addresses_found": [],
        "schema_markup": {},
        "nap_markup": {},
        "google_maps": {},
        "pages_scanned": 0,
        "issues": [],
        "recommendations": []
    }

    all_content = ""

    for root, dirs, files in os.walk(project_path):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]

        for file in files:
            if Path(file).suffix not in PAGE_EXTENSIONS:
                continue

            filepath = Path(root) / file
            results["pages_scanned"] += 1

            try:
                with open(filepath, 'r', encoding='utf-8', errors='ignore') as f:
                    content = f.read()
                    all_content += content

                    # Find phones and addresses
                    phones = find_phone_numbers(content)
                    addresses = find_addresses(content)

                    results["phones_found"].extend(phones)
                    results["addresses_found"].extend(addresses)

            except Exception:
                pass

    # Deduplicate
    results["phones_found"] = list(set(results["phones_found"]))
    results["addresses_found"] = list(set(results["addresses_found"]))

    # Check schema and NAP in all content
    results["schema_markup"] = check_schema_markup(all_content)
    results["nap_markup"] = check_nap_markup(all_content)
    results["google_maps"] = check_google_maps(all_content)
    results["contact_page"] = check_contact_page(project_path)

    # Generate issues and recommendations
    analyze_results(results)

    return results


def analyze_results(results: Dict) -> None:
    """Analyze results and generate issues/recommendations."""
    issues = results["issues"]
    recommendations = results["recommendations"]

    # Phone check
    if not results["phones_found"]:
        issues.append({
            "severity": "high",
            "type": "missing_phone",
            "message": "No phone number found on the website"
        })
        recommendations.append("Add phone number in prominent location (header/footer)")
    elif len(set(results["phones_found"])) > 2:
        issues.append({
            "severity": "medium",
            "type": "multiple_phones",
            "message": f"Multiple phone formats found: {len(set(results['phones_found']))}"
        })
        recommendations.append("Standardize phone number format across the site")

    # Address check
    if not results["addresses_found"]:
        issues.append({
            "severity": "high",
            "type": "missing_address",
            "message": "No address found on the website"
        })
        recommendations.append("Add full business address with postal code")

    # Schema check
    if not results["schema_markup"].get("LocalBusiness"):
        issues.append({
            "severity": "high",
            "type": "missing_schema",
            "message": "LocalBusiness schema markup not found"
        })
        recommendations.append("Add LocalBusiness JSON-LD schema markup")

    if not results["schema_markup"].get("PostalAddress"):
        issues.append({
            "severity": "medium",
            "type": "missing_address_schema",
            "message": "PostalAddress schema not found"
        })
        recommendations.append("Add structured address data with PostalAddress schema")

    if not results["schema_markup"].get("GeoCoordinates"):
        issues.append({
            "severity": "low",
            "type": "missing_geo",
            "message": "GeoCoordinates not found in schema"
        })
        recommendations.append("Add latitude/longitude to LocalBusiness schema")

    # Google Maps check
    if not any(results["google_maps"].values()):
        issues.append({
            "severity": "medium",
            "type": "missing_map",
            "message": "No Google Maps embed found"
        })
        recommendations.append("Embed Google Maps on contact page")

    # Contact page check
    if not results["contact_page"]["has_contact_page"]:
        issues.append({
            "severity": "medium",
            "type": "missing_contact_page",
            "message": "No dedicated contact page found"
        })
        recommendations.append("Create a dedicated contact/iletisim page")


def calculate_score(results: Dict) -> int:
    """Calculate local SEO score (0-100)."""
    score = 100
    severity_weights = {"high": 20, "medium": 10, "low": 5}

    for issue in results["issues"]:
        score -= severity_weights.get(issue["severity"], 5)

    return max(0, score)


# ============================================================================
#  MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(description="Local SEO Audit")
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    parser.add_argument("--output", "-o", help="Output JSON file")
    parser.add_argument("--summary", "-s", action="store_true", help="Print summary only")

    args = parser.parse_args()

    project_path = Path(args.project_path).resolve()

    if not project_path.is_dir():
        print(f"Error: Not a directory: {project_path}")
        sys.exit(1)

    print(f"\n{'='*60}")
    print(f"[LOCAL SEO AUDIT]")
    print(f"{'='*60}")
    print(f"Project: {project_path}")

    # Run scan
    results = scan_project(project_path)
    results["score"] = calculate_score(results)
    results["project"] = str(project_path)

    # Print summary
    print(f"\nScore: {results['score']}/100")
    print(f"Pages scanned: {results['pages_scanned']}")
    print(f"Issues found: {len(results['issues'])}")
    print(f"\n{'-'*60}")

    if not args.summary:
        print("\nFINDINGS:")
        print(f"  Phones: {results['phones_found']}")
        print(f"  Addresses: {len(results['addresses_found'])} patterns found")
        print(f"\nSCHEMA MARKUP:")
        for schema, found in results["schema_markup"].items():
            status = "[OK]" if found else "[MISSING]"
            print(f"  {status} {schema}")

        print(f"\nGOOGLE MAPS:")
        for check, found in results["google_maps"].items():
            status = "[OK]" if found else "[MISSING]"
            print(f"  {status} {check}")

        print(f"\nISSUES:")
        for issue in results["issues"]:
            print(f"  [{issue['severity'].upper()}] {issue['message']}")

        print(f"\nRECOMMENDATIONS:")
        for rec in results["recommendations"]:
            print(f"  - {rec}")

    # Output JSON
    if args.output:
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"\nReport saved to: {args.output}")

    print(f"\n{'='*60}\n")

    # Exit code based on score
    sys.exit(0 if results["score"] >= 60 else 1)


if __name__ == "__main__":
    main()

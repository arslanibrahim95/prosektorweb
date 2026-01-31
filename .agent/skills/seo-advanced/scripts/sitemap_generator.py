#!/usr/bin/env python3
"""
Script: sitemap_generator.py
Purpose: Generate or update XML sitemap from project files
Usage: python sitemap_generator.py <project_path> [--base-url https://example.com] [--output sitemap.xml]
"""

import os
import sys
import argparse
import json
from pathlib import Path
from datetime import datetime
from typing import Dict, List, Set
import re

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    pass


# ============================================================================
#  CONFIGURATION
# ============================================================================

# File patterns to include
PAGE_PATTERNS = {
    "nextjs_app": ["**/page.tsx", "**/page.jsx", "**/page.ts", "**/page.js"],
    "nextjs_pages": ["pages/**/*.tsx", "pages/**/*.jsx"],
    "astro": ["src/pages/**/*.astro", "src/pages/**/*.md", "src/pages/**/*.mdx"],
    "html": ["**/*.html"],
    "markdown": ["**/*.md", "**/*.mdx"]
}

# Directories to skip
SKIP_DIRS = {
    "node_modules", ".git", ".next", "dist", "build",
    "__pycache__", ".venv", "venv", "api", "_*"
}

# Default priorities by path depth/type
PRIORITY_RULES = {
    "/": 1.0,
    "/*": 0.8,
    "/*/*": 0.6,
    "/*/*/*": 0.4,
    "blog/*": 0.7,
    "products/*": 0.8
}

# Default change frequencies
CHANGEFREQ_RULES = {
    "/": "weekly",
    "blog/*": "weekly",
    "products/*": "daily",
    "about": "monthly",
    "contact": "monthly"
}


# ============================================================================
#  DETECTION
# ============================================================================

def detect_project_type(project_path: Path) -> str:
    """Detect the project type based on files present."""
    if (project_path / "next.config.js").exists() or (project_path / "next.config.mjs").exists():
        if (project_path / "app").exists():
            return "nextjs_app"
        return "nextjs_pages"
    if (project_path / "astro.config.mjs").exists():
        return "astro"
    if list(project_path.glob("**/*.html")):
        return "html"
    return "markdown"


def extract_routes_nextjs_app(project_path: Path) -> List[Dict]:
    """Extract routes from Next.js App Router."""
    routes = []
    app_dir = project_path / "app"

    if not app_dir.exists():
        return routes

    for page_file in app_dir.rglob("page.*"):
        # Skip files in excluded directories
        if any(part.startswith("_") or part in SKIP_DIRS for part in page_file.parts):
            continue

        # Convert file path to route
        relative = page_file.relative_to(app_dir)
        route_parts = list(relative.parts[:-1])  # Remove 'page.tsx'

        # Handle dynamic routes
        processed_parts = []
        for part in route_parts:
            if part.startswith("[") and part.endswith("]"):
                # Skip dynamic routes for static sitemap
                continue
            if part.startswith("(") and part.endswith(")"):
                # Route groups - skip the group name
                continue
            processed_parts.append(part)

        route = "/" + "/".join(processed_parts)
        if route.endswith("/") and route != "/":
            route = route[:-1]

        # Get last modified time
        mtime = datetime.fromtimestamp(page_file.stat().st_mtime)

        routes.append({
            "loc": route,
            "lastmod": mtime.strftime("%Y-%m-%d"),
            "file": str(page_file)
        })

    return routes


def extract_routes_astro(project_path: Path) -> List[Dict]:
    """Extract routes from Astro project."""
    routes = []
    pages_dir = project_path / "src" / "pages"

    if not pages_dir.exists():
        return routes

    for page_file in pages_dir.rglob("*"):
        if page_file.is_dir():
            continue
        if page_file.suffix not in [".astro", ".md", ".mdx"]:
            continue

        relative = page_file.relative_to(pages_dir)
        route_parts = list(relative.parts)

        # Remove file extension
        route_parts[-1] = route_parts[-1].rsplit(".", 1)[0]

        # Handle index files
        if route_parts[-1] == "index":
            route_parts = route_parts[:-1]

        route = "/" + "/".join(route_parts)
        if not route:
            route = "/"

        mtime = datetime.fromtimestamp(page_file.stat().st_mtime)

        routes.append({
            "loc": route,
            "lastmod": mtime.strftime("%Y-%m-%d"),
            "file": str(page_file)
        })

    return routes


def extract_routes_html(project_path: Path) -> List[Dict]:
    """Extract routes from HTML files."""
    routes = []

    for html_file in project_path.rglob("*.html"):
        if any(part in SKIP_DIRS for part in html_file.parts):
            continue

        relative = html_file.relative_to(project_path)
        route_parts = list(relative.parts)

        # Handle index.html
        if route_parts[-1] == "index.html":
            route_parts = route_parts[:-1]
        else:
            route_parts[-1] = route_parts[-1].replace(".html", "")

        route = "/" + "/".join(route_parts)
        if not route:
            route = "/"

        mtime = datetime.fromtimestamp(html_file.stat().st_mtime)

        routes.append({
            "loc": route,
            "lastmod": mtime.strftime("%Y-%m-%d"),
            "file": str(html_file)
        })

    return routes


# ============================================================================
#  SITEMAP GENERATION
# ============================================================================

def calculate_priority(route: str) -> float:
    """Calculate priority based on route."""
    if route == "/":
        return 1.0

    depth = route.count("/")
    if depth == 1:
        return 0.8
    elif depth == 2:
        return 0.6
    else:
        return 0.4


def calculate_changefreq(route: str) -> str:
    """Calculate change frequency based on route."""
    if route == "/":
        return "weekly"
    if "blog" in route:
        return "weekly"
    if "product" in route:
        return "daily"
    return "monthly"


def generate_sitemap_xml(routes: List[Dict], base_url: str) -> str:
    """Generate XML sitemap content."""
    lines = [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
    ]

    # Sort routes (homepage first, then alphabetically)
    routes_sorted = sorted(routes, key=lambda x: (x["loc"] != "/", x["loc"]))

    for route in routes_sorted:
        loc = route["loc"]
        full_url = base_url.rstrip("/") + loc

        priority = calculate_priority(loc)
        changefreq = calculate_changefreq(loc)

        lines.append("  <url>")
        lines.append(f"    <loc>{full_url}</loc>")
        lines.append(f"    <lastmod>{route['lastmod']}</lastmod>")
        lines.append(f"    <changefreq>{changefreq}</changefreq>")
        lines.append(f"    <priority>{priority:.1f}</priority>")
        lines.append("  </url>")

    lines.append("</urlset>")

    return "\n".join(lines)


# ============================================================================
#  MAIN
# ============================================================================

def main():
    parser = argparse.ArgumentParser(
        description="Generate XML sitemap from project files"
    )
    parser.add_argument("project_path", nargs="?", default=".", help="Project directory")
    parser.add_argument("--base-url", "-b", required=True, help="Base URL (e.g., https://example.com)")
    parser.add_argument("--output", "-o", help="Output file (default: sitemap.xml in project)")
    parser.add_argument("--json", action="store_true", help="Output JSON instead of XML")

    args = parser.parse_args()

    project_path = Path(args.project_path).resolve()

    if not project_path.is_dir():
        print(f"Error: Not a directory: {project_path}")
        sys.exit(1)

    # Detect project type
    project_type = detect_project_type(project_path)
    print(f"Detected project type: {project_type}")

    # Extract routes
    if project_type == "nextjs_app":
        routes = extract_routes_nextjs_app(project_path)
    elif project_type == "astro":
        routes = extract_routes_astro(project_path)
    else:
        routes = extract_routes_html(project_path)

    print(f"Found {len(routes)} routes")

    # Generate output
    if args.json:
        output = json.dumps(routes, indent=2, ensure_ascii=False)
    else:
        output = generate_sitemap_xml(routes, args.base_url)

    # Write output
    if args.output:
        output_path = Path(args.output)
    else:
        output_path = project_path / ("sitemap.json" if args.json else "sitemap.xml")

    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(output)

    print(f"Sitemap saved to: {output_path}")

    # Summary
    print("\nRoutes:")
    for route in sorted(routes, key=lambda x: x["loc"]):
        print(f"  {route['loc']}")


if __name__ == "__main__":
    main()

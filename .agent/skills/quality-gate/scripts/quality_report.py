#!/usr/bin/env python3
"""
Script: quality_report.py
Purpose: Generate HTML quality report from checklist.py JSON output
Usage: python quality_report.py <json_report> [--output report.html]
"""

import json
import sys
import argparse
from pathlib import Path
from datetime import datetime

# Fix Windows console encoding
try:
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
except AttributeError:
    pass


HTML_TEMPLATE = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Quality Gate Report</title>
    <style>
        :root {{
            --pass: #22c55e;
            --fail: #ef4444;
            --warn: #f59e0b;
            --skip: #6b7280;
            --bg: #0f172a;
            --card: #1e293b;
            --text: #f1f5f9;
            --muted: #94a3b8;
        }}
        * {{ margin: 0; padding: 0; box-sizing: border-box; }}
        body {{
            font-family: system-ui, -apple-system, sans-serif;
            background: var(--bg);
            color: var(--text);
            padding: 2rem;
            line-height: 1.6;
        }}
        .container {{ max-width: 1200px; margin: 0 auto; }}
        h1 {{ font-size: 2rem; margin-bottom: 0.5rem; }}
        .meta {{ color: var(--muted); margin-bottom: 2rem; }}
        .summary {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
            margin-bottom: 2rem;
        }}
        .stat {{
            background: var(--card);
            padding: 1.5rem;
            border-radius: 0.5rem;
            text-align: center;
        }}
        .stat-value {{ font-size: 2rem; font-weight: bold; }}
        .stat-label {{ color: var(--muted); font-size: 0.875rem; }}
        .gate-status {{
            padding: 1.5rem;
            border-radius: 0.5rem;
            text-align: center;
            font-size: 1.5rem;
            font-weight: bold;
            margin-bottom: 2rem;
        }}
        .gate-passed {{ background: rgba(34, 197, 94, 0.2); color: var(--pass); }}
        .gate-failed {{ background: rgba(239, 68, 68, 0.2); color: var(--fail); }}
        .checks {{ display: flex; flex-direction: column; gap: 1rem; }}
        .check {{
            background: var(--card);
            padding: 1rem 1.5rem;
            border-radius: 0.5rem;
            display: flex;
            align-items: center;
            gap: 1rem;
        }}
        .check-icon {{
            width: 2rem;
            height: 2rem;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-weight: bold;
            flex-shrink: 0;
        }}
        .icon-pass {{ background: var(--pass); color: white; }}
        .icon-fail {{ background: var(--fail); color: white; }}
        .icon-skip {{ background: var(--skip); color: white; }}
        .check-info {{ flex: 1; }}
        .check-name {{ font-weight: 600; }}
        .check-meta {{ color: var(--muted); font-size: 0.875rem; }}
        .check-duration {{ color: var(--muted); font-size: 0.875rem; }}
        .blocking-tag {{
            background: rgba(239, 68, 68, 0.2);
            color: var(--fail);
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.75rem;
            font-weight: 600;
        }}
        .issues {{
            margin-top: 0.5rem;
            padding-left: 1rem;
            border-left: 2px solid var(--fail);
        }}
        .issue {{ color: var(--fail); font-size: 0.875rem; }}
        footer {{
            margin-top: 2rem;
            text-align: center;
            color: var(--muted);
            font-size: 0.875rem;
        }}
    </style>
</head>
<body>
    <div class="container">
        <h1>Quality Gate Report</h1>
        <p class="meta">
            Project: {project}<br>
            Generated: {timestamp}<br>
            Duration: {duration}ms
        </p>

        <div class="gate-status {gate_class}">
            {gate_status}
        </div>

        <div class="summary">
            <div class="stat">
                <div class="stat-value">{total_checks}</div>
                <div class="stat-label">Total Checks</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: var(--pass)">{passed_checks}</div>
                <div class="stat-label">Passed</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: var(--fail)">{failed_checks}</div>
                <div class="stat-label">Failed</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: var(--skip)">{skipped_checks}</div>
                <div class="stat-label">Skipped</div>
            </div>
            <div class="stat">
                <div class="stat-value" style="color: var(--fail)">{blocking_failures}</div>
                <div class="stat-label">Blocking</div>
            </div>
        </div>

        <h2 style="margin-bottom: 1rem;">Checks</h2>
        <div class="checks">
            {checks_html}
        </div>

        <footer>
            Generated by Maestro Quality Gate
        </footer>
    </div>
</body>
</html>
"""

CHECK_TEMPLATE = """
<div class="check">
    <div class="check-icon {icon_class}">{icon}</div>
    <div class="check-info">
        <div class="check-name">
            P{priority} - {display}
            {blocking_tag}
        </div>
        <div class="check-meta">Status: {status}</div>
        {issues_html}
    </div>
    <div class="check-duration">{duration}ms</div>
</div>
"""


def generate_check_html(check: dict) -> str:
    """Generate HTML for a single check."""
    passed = check.get("passed", False)
    status = check.get("status", "unknown")

    if status == "skipped":
        icon_class = "icon-skip"
        icon = "-"
    elif passed and check.get("evaluation", {}).get("meets_threshold", True):
        icon_class = "icon-pass"
        icon = "OK"
    else:
        icon_class = "icon-fail"
        icon = "X"

    blocking_tag = '<span class="blocking-tag">BLOCKING</span>' if check.get("blocking") else ""

    issues = check.get("evaluation", {}).get("issues", [])
    issues_html = ""
    if issues:
        issues_html = '<div class="issues">' + "".join(
            f'<div class="issue">- {issue}</div>' for issue in issues
        ) + '</div>'

    return CHECK_TEMPLATE.format(
        icon_class=icon_class,
        icon=icon,
        priority=check.get("priority", "?"),
        display=check.get("display", check.get("name", "Unknown")),
        blocking_tag=blocking_tag,
        status=status,
        issues_html=issues_html,
        duration=check.get("duration_ms", 0)
    )


def generate_report(data: dict) -> str:
    """Generate full HTML report."""
    summary = data.get("summary", {})
    checks = data.get("checks", [])

    # Sort checks by priority
    checks_sorted = sorted(checks, key=lambda x: (x.get("priority", 99), x.get("name", "")))

    checks_html = "\n".join(generate_check_html(c) for c in checks_sorted)

    gate_passed = summary.get("gate_passed", False)
    gate_class = "gate-passed" if gate_passed else "gate-failed"
    gate_status = "QUALITY GATE PASSED" if gate_passed else "QUALITY GATE FAILED"

    return HTML_TEMPLATE.format(
        project=data.get("project", "Unknown"),
        timestamp=data.get("timestamp", datetime.now().isoformat()),
        duration=data.get("total_duration_ms", 0),
        gate_class=gate_class,
        gate_status=gate_status,
        total_checks=summary.get("total_checks", 0),
        passed_checks=summary.get("passed_checks", 0),
        failed_checks=summary.get("failed_checks", 0),
        skipped_checks=summary.get("skipped_checks", 0),
        blocking_failures=summary.get("blocking_failures", 0),
        checks_html=checks_html
    )


def main():
    parser = argparse.ArgumentParser(description="Generate HTML quality report")
    parser.add_argument("json_report", help="Path to JSON report from checklist.py")
    parser.add_argument("--output", "-o", default="quality-report.html", help="Output HTML file")

    args = parser.parse_args()

    # Read JSON report
    json_path = Path(args.json_report)
    if not json_path.exists():
        print(f"Error: File not found: {json_path}")
        sys.exit(1)

    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON: {e}")
        sys.exit(1)

    # Generate HTML
    html = generate_report(data)

    # Write output
    output_path = Path(args.output)
    with open(output_path, 'w', encoding='utf-8') as f:
        f.write(html)

    print(f"Report generated: {output_path}")


if __name__ == "__main__":
    main()

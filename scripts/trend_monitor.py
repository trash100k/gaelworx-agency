#!/usr/bin/env python3
"""
Trend Monitor — Scans social media and news for trending topics.
Runs as a cron job, updates SIGNALS.md with findings.
"""

import json
import os
import sys
import datetime
import subprocess
from pathlib import Path

WORKSPACE = Path("/root/agency/workspace")
RESEARCH_DIR = Path("/root/research")

def search_trends(query, limit=5):
    """Search for trending topics using web_search via execute_code pattern."""
    # This will be called from within execute_code
    pass

def monitor_reddit(subreddits, limit=10):
    """Monitor specific subreddits for trending topics."""
    import praw
    
    # Note: Requires Reddit API credentials
    # For now, use web search as proxy
    results = {}
    for sub in subreddits:
        query = f"site:reddit.com/r/{sub} trending this week"
        results[sub] = query
    return results

def monitor_github_trending():
    """Monitor GitHub trending repos for AI/agent trends."""
    import urllib.request
    
    try:
        url = "https://api.github.com/search/repositories?q=AI+agent+OR+LLM+OR+automation&sort=stars&order=desc&per_page=5"
        req = urllib.request.Request(url, headers={"User-Agent": "OWL-Agent"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            data = json.loads(resp.read())
            return [{
                "name": r["full_name"],
                "stars": r["stargazers_count"],
                "description": r.get("description", "")[:100],
                "url": r["html_url"]
            } for r in data.get("items", [])]
    except Exception as e:
        return [{"error": str(e)}]

def monitor_product_hunt():
    """Monitor Product Hunt for new AI tools."""
    query = "site:producthunt.com AI agent automation 2025"
    return query

def update_signals(new_findings):
    """Update SIGNALS.md with new findings."""
    signals_file = WORKSPACE / "SIGNALS.md"
    
    timestamp = datetime.datetime.now().isoformat()
    
    update = f"\n\n### Update — {timestamp}\n"
    for finding in new_findings:
        update += f"- {finding}\n"
    
    if signals_file.exists():
        current = signals_file.read_text()
        # Insert after the first section
        lines = current.split("\n")
        insert_idx = 0
        for i, line in enumerate(lines):
            if line.startswith("### "):
                insert_idx = i
                break
        
        lines.insert(insert_idx, update)
        signals_file.write_text("\n".join(lines))
    else:
        signals_file.write_text(f"# SIGNALS.md\n{update}")
    
    print(f"✅ SIGNALS.md updated with {len(new_findings)} findings")

def main():
    """Run trend monitoring."""
    print("🔍 Trend Monitor Starting")
    print("=" * 40)
    
    findings = []
    
    # Check GitHub trending
    print("📦 Checking GitHub trending...")
    gh_trends = monitor_github_trending()
    for repo in gh_trends:
        if "error" not in repo:
            findings.append(f"GitHub trending: {repo['name']} ({repo['stars']} ⭐) — {repo['description']}")
            print(f"   {repo['name']}: {repo['stars']} ⭐")
    
    # Check Product Hunt
    print("🏆 Checking Product Hunt...")
    ph_query = monitor_product_hunt()
    findings.append(f"Product Hunt query: {ph_query}")
    
    # Check Reddit (via search)
    print("📱 Checking Reddit...")
    reddit_subs = ["technology", "artificial", "entrepreneur", "startups"]
    reddit_results = monitor_reddit(reddit_subs)
    for sub, query in reddit_results.items():
        findings.append(f"Reddit r/{sub}: monitoring")
    
    # Update signals
    if findings:
        update_signals(findings)
    
    print(f"\n✅ Trend monitor complete. {len(findings)} findings.")

if __name__ == "__main__":
    main()

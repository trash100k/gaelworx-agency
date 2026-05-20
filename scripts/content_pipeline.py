#!/usr/bin/env python3
"""
Social Media Content Pipeline
Generates platform-specific content from trend signals.
"""

import json
import os
import sys
import datetime
import requests
from pathlib import Path

# Configuration
WORKSPACE = Path("/root/agency/workspace")
OUTPUT_DIR = Path("/root/agency/output")
OUTPUT_DIR.mkdir(exist_ok=True)

def load_signals():
    """Load current signals from workspace."""
    signals_file = WORKSPACE / "SIGNALS.md"
    if signals_file.exists():
        return signals_file.read_text()
    return ""

def generate_content_brief(topic, platform, tone="professional"):
    """Generate a content brief for a specific platform."""
    briefs = {
        "twitter": {
            "max_length": 280,
            "style": "concise, punchy, thread-friendly",
            "hashtags": 2,
            "cta": "question or poll"
        },
        "linkedin": {
            "max_length": 3000,
            "style": "professional, story-driven, value-first",
            "hashtags": 3,
            "cta": "comment prompt"
        },
        "instagram": {
            "max_length": 2200,
            "style": "visual-first, emoji-friendly, personal",
            "hashtags": 5,
            "cta": "save/share prompt"
        },
        "reddit": {
            "max_length": 4000,
            "style": "authentic, value-driven, no selling",
            "hashtags": 0,
            "cta": "discussion prompt"
        },
        "tiktok": {
            "max_length": 150,
            "style": "casual, trend-aware, hook-driven",
            "hashtags": 3,
            "cta": "follow/duet prompt"
        }
    }
    return briefs.get(platform, briefs["twitter"])

def create_content_calendar(days=7):
    """Create a content calendar for the next N days."""
    today = datetime.date.today()
    calendar = []
    
    platforms = ["twitter", "linkedin", "instagram", "reddit"]
    
    for i in range(days):
        date = today + datetime.timedelta(days=i)
        day_plan = {
            "date": date.isoformat(),
            "platforms": {}
        }
        
        # Rotate platforms across days
        primary = platforms[i % len(platforms)]
        secondary = platforms[(i + 1) % len(platforms)]
        
        day_plan["platforms"][primary] = {
            "type": "primary",
            "posts": 2,
            "format": "original"
        }
        day_plan["platforms"][secondary] = {
            "type": "secondary", 
            "posts": 1,
            "format": "repurposed"
        }
        
        calendar.append(day_plan)
    
    return calendar

def main():
    """Main pipeline execution."""
    print("🚀 Social Media Content Pipeline")
    print("=" * 40)
    
    # Load signals
    signals = load_signals()
    print(f"📊 Signals loaded: {len(signals)} chars")
    
    # Generate content calendar
    calendar = create_content_calendar(7)
    
    # Save calendar
    date_str = datetime.date.today().isoformat()
    calendar_file = OUTPUT_DIR / f"content-calendar-{date_str}.json"
    with open(calendar_file, "w") as f:
        json.dump(calendar, f, indent=2)
    
    print(f"📅 Content calendar: {calendar_file}")
    print(f"   Days planned: {len(calendar)}")
    print(f"   Total posts: {sum(sum(p['posts'] for p in d['platforms'].values()) for d in calendar)}")
    
    # Generate content briefs for each platform
    for platform in ["twitter", "linkedin", "instagram", "reddit"]:
        brief = generate_content_brief("trending topic", platform)
        print(f"\n📝 {platform.upper()} brief:")
        for k, v in brief.items():
            print(f"   {k}: {v}")
    
    print(f"\n✅ Pipeline complete. Output: {OUTPUT_DIR}")

if __name__ == "__main__":
    main()

# TOOLS INVENTORY — What I Have vs What I Need
## Last updated: 2026-05-17

---

## ✅ INSTALLED & READY

### Browsing & Automation
- **Hermes built-in browser tools** — `browser_navigate`, `browser_click`, `browser_snapshot`, `browser_vision`, etc. (primary)
- **agent-browser** — v0.27.0, Rust CLI, ref-based workflow, globally available at `/usr/local/bin/agent-browser`
- **Google Chrome** — `/usr/bin/google-chrome` v148 (system browser)
- **Chrome for Testing** — v148.0.7778.167, managed by agent-browser at `~/.agent-browser/browsers/`

### AI/ML
- **Ollama** — running locally with `llama3.2:3b` (2GB)
- **Python 3.11** — anthropic, openai, numpy, Pillow, edge-tts installed
- **Node.js v24** — npm, corepack

### Content Generation
- **ffmpeg** — audio/video processing
- **edge-tts** — text-to-speech (Microsoft Edge TTS, free)
- **Pillow** — image processing

### Social Media APIs (Python)
- **tweepy** — Twitter/X API
- **praw** — Reddit API
- **instaloader** — Instagram scraping
- **python-telegram-bot** — Telegram Bot API
- **discord.py** — Discord API
- **slack_bolt / slack_sdk** — Slack API

### Automation Platforms
- **n8n** — v2.19.5, Docker, PostgreSQL backend, API key configured
- **Docker** — v29.1.3, running n8n + PostgreSQL + Redis + SearXNG + OpenWebUI + Qdrant + Traefik + Dockge

### Search
- **SearXNG** — privacy-focused search aggregator, running in Docker

### GitHub
- **gh CLI** — GitHub CLI installed (not authenticated, using API instead)

### Agent Frameworks (Cloned)
- **agency-agents** — 55+ personality templates
- **openclaw-multi-agent-kit** — production 10-agent templates

---

## ❌ NEED FROM ZACH (Tokens/Logins)

### Social Media Accounts
1. **Twitter/X** — API keys (Bearer Token, API Key/Secret, Access Token/Secret)
   - Get from: developer.twitter.com
   - Cost: Free tier (1,500 tweets/mo read, 575 tweets/mo write)
2. **Reddit** — API credentials (client_id, client_secret, username, password)
   - Get from: reddit.com/prefs/apps
   - Cost: Free
3. **Telegram** — Bot token
   - Get from: @BotFather on Telegram
   - Cost: Free
4. **LinkedIn** — API access (or cookie-based scraping)
   - Get from: developer.linkedin.com
   - Cost: Limited free tier
5. **Instagram** — Login credentials (for posting)
   - Note: Official API is limited; may need cookie-based auth

### Content Generation
6. **OpenAI API Key** — For GPT-4o and DALL-E (optional, can use Ollama free)
7. **Anthropic API Key** — For Claude (optional, can use OpenRouter free)
8. **ElevenLabs API Key** — For high-quality TTS (optional, edge-tts is free)
9. **Suno API Key** — For AI music generation (optional)

### Video/Audio
10. **YouTube** — API key or OAuth (for uploading videos)
    - Get from: console.cloud.google.com

### Payment
11. **Stripe** — API keys (for receiving payments from clients)
    - Get from: dashboard.stripe.com

---

## 🔧 TO BUILD/SET UP

### Immediate (This Week)
1. n8n workflows for content pipeline
2. Agent personality templates (5 core agents)
3. Content calendar automation
4. Trend monitoring system
5. Social media posting pipeline

### Near-Term (Week 2-3)
6. Video script → voiceover → edit pipeline
7. Multi-agent coordination system
8. Client onboarding automation
9. Revenue tracking dashboard
10. Portfolio/demo site

### Medium-Term (Month 2)
11. White label personality pack marketplace
12. Content quality scoring tool
13. Multi-agent dashboard
14. Social media ROI tracker

---

## 🚧 OBSTACLES & SOLUTIONS

- **Social media API rate limits** → Rotate between platforms, use scheduling
- **Login walls on sites** → Use browser automation with saved cookies
- **CAPTCHAs** → Use 2captcha API or manual intervention
- **Free model rate limits** → Use Ollama local for Tier 1, batch API calls
- **Content quality** → Human-in-the-loop + AI slop detection
- **Video production cost** → edge-tts (free) + ffmpeg (free) + AI images

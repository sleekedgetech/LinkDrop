# LinkDrop Design Specification
**Date:** 2026-11-01  
**Project:** LinkDrop — All-in-One Multi-Platform Video Downloader & Telegram Community Ad Engine  
**Deployment Target:** Cloudflare Pages / Workers (Next.js 14+ App Router)  
**Primary Font:** Manrope (Google Fonts)

---

## 1. Executive Summary & Goals

LinkDrop is a high-performance, watermark-free media downloader ecosystem that operates both as a **Telegram Community Bot** with native group Slow Mode (60s countdown) and monetizable ad captions, and as a **Sleek Web Downloader & Admin Dashboard** running on Next.js 14+ and Cloudflare's Edge network.

### Core Objectives
1. **Zero-Watermark Extraction**: Support TikTok (clean HD video without watermark or end cards), Instagram (Reels, Stories, Posts), YouTube (Videos, Shorts, 320kbps MP3 Audio), Snapchat (Spotlight), Facebook, and X/Twitter.
2. **Community Bot Monetization**: Run inside Telegram groups/communities. When users send video links, the bot responds with the playable video directly in the chat, accompanied by sponsor ad copy and promo links configured from the web admin panel.
3. **Telegram Native Slow Mode**: Leverage Telegram's native group slow-mode delay (60 seconds) so users see the countdown directly in their message input box (`Slow mode: 59... 58... s`) without annoying bot spam.
4. **Cloudflare Edge Optimized**: Utilize zero-memory streaming where Cloudflare passes direct media URLs to Telegram's `sendVideo` API, allowing Telegram's servers to handle heavy downloads without exhausting Cloudflare worker memory or timing out.
5. **Human-Crafted Sleek UI**: Built with the **Manrope** typeface, crisp dark slate & obsidian surfaces, sharp borders, micro-interactions, and zero generic "AI smoke/purple fog" cliches. Ready to adopt brand accent colors upon logo delivery.

---

## 2. Architecture & Tech Stack

```
                                 [ Cloudflare Edge Network ]
                                              │
           ┌──────────────────────────────────┴──────────────────────────────────┐
           ▼                                                                     ▼
[ Telegram Community Update ]                                          [ Web Visitor / Admin ]
  POST /api/telegram/webhook                                             GET / (Landing / Downloader)
           │                                                             GET /admin (Ad Management)
           ▼                                                                     │
┌──────────────────────────────┐                                                 ▼
│  Webhook Controller          │                                        ┌─────────────────────────┐
│  - Verifies Telegram secret  │                                        │  Next.js App Router UI  │
│  - Parses URL from message   │                                        │  - Font: Manrope        │
│  - Detects platform          │                                        │  - Tailwind CSS         │
└──────────────┬───────────────┘                                        │  - Lucide Icons         │
               │                                                        └────────────┬────────────┘
               ▼                                                                     │
┌────────────────────────────────────────────────────────┐                           │
│  Multi-Engine Extraction Pipeline                      │◄──────────────────────────┘
│  - Primary: Cobalt v10 REST Engine (No Watermark)      │     POST /api/extract
│  - Fallback 1: TikWM Direct API (TikTok HD Clean)      │
│  - Fallback 2: Instagram / YouTube Direct Resolvers    │
└──────────────┬─────────────────────────────────────────┘
               │ Returns: { url, title, thumbnail, duration, format }
               ▼
┌────────────────────────────────────────────────────────┐
│  Cloudflare KV / Storage Layer                         │
│  - Active Sponsor Ad Title, Body & Click URL           │
│  - Bot Statistics (Total Downloads, Platforms breakdown│
│  - Configured Slow Mode Delay (e.g. 60s)               │
└──────────────┬─────────────────────────────────────────┘
               │
               ▼
┌────────────────────────────────────────────────────────┐
│  Telegram Bot API Delivery                             │
│  - Calls sendVideo / sendAudio with extracted clean URL│
│  - Appends Dynamic Sponsor Caption & CTA               │
│  - Attaches Inline Keyboard (Direct Download / Sponsor)│
└────────────────────────────────────────────────────────┘
```

### Technology Matrix
- **Framework**: Next.js 14+ (App Router, Server Actions, Route Handlers)
- **Deployment**: Cloudflare Pages / Workers (`@opennextjs/cloudflare`)
- **Styling**: Tailwind CSS + `clsx` + `tailwind-merge`
- **Typography**: Manrope (`next/font/google`)
- **Icons**: `lucide-react`
- **State & Storage**: Cloudflare KV for settings and stats (with in-memory fallback for local development)
- **Extraction Protocol**: Dual-engine pipeline (Cobalt API v10 + direct TikWM/IG fallbacks)

---

## 3. Multi-Engine Media Scraper

### Supported Platforms & Resolvers
1. **TikTok**:
   - Strips watermark, removes author outro splash.
   - Extracts 1080p/720p H.264 MP4 and original audio MP3.
   - Engine: Cobalt v10 with TikWM API (`https://www.tikwm.com/api/`) fallback.
2. **Instagram**:
   - Supports Reels, video posts, and carousel videos.
   - Direct CDN extraction without login requirement.
3. **YouTube**:
   - Supports YouTube Shorts and standard videos.
   - Quality selection: 1080p, 720p, 480p, and MP3 audio stream.
4. **Snapchat, Facebook, Twitter/X, Reddit**:
   - Universal handling via Cobalt media extraction engine.

### Error Handling & Fallback
If the primary Cobalt instance encounters rate limiting or downtime:
- The system automatically triggers the secondary platform-specific resolver.
- If direct URL fails Telegram's 50MB file size limit, the bot gracefully sends an interactive message with a direct fast download button rather than crashing.

---

## 4. Telegram Community Bot Specification

### Group Setup & Native Slow Mode
1. **Bot Registration**: Bot runs via webhook set to `https://<domain>/api/telegram/webhook`.
2. **Slow Mode Enforcement**:
   - The bot can programmatically ensure slow mode is set using Telegram's `setChatSlowModeDelay` API (default: 60 seconds).
   - In Telegram supergroups, this triggers the native client countdown on the user's message input bar.
3. **Message Processing**:
   - When a member posts a message containing a recognized link (`tiktok.com`, `instagram.com`, `youtube.com`, `snapchat.com`, etc.):
   - The bot sends a temporary "⚡ Processing your video..." status indicator or reaction.
   - Upon successful extraction, the bot sends `sendVideo` containing:
     - The video file.
     - **Sponsor Caption**:  
       ```
       ✨ Downloaded via LinkDrop (No Watermark)

       📢 [Sponsor Headline]
       👉 [Sponsor Call To Action & Link]
       ```
     - Inline button pointing to the sponsor / web dashboard.
   - Deletes the temporary status message to keep the group pristine.

---

## 5. Web Interface & Admin Dashboard Design

### Visual Design System
- **Tone**: Obsidian & Dark Slate, crisp 1px borders (`border-white/10`), subtle card elevation, zero cheesy gradients or AI smoke haze.
- **Font**: Manrope with clean tracking and high-contrast typography.
- **Theme**: Dark-first with high readability.
- **Platform Badges**: Subtle neon accents per platform (TikTok: cyan/magenta dots, Instagram: sunset rose, YouTube: crimson red, Snapchat: warm amber).

### Web Pages
1. **Landing / Downloader (`/`)**:
   - Clean, focused URL input box with auto-clipboard paste button.
   - Live platform detector badge as user types.
   - Quality picker (HD Video / MP3 Audio).
   - "Join our Telegram Community" banner CTA.
   - Live video preview card with direct download button.
2. **Admin Panel (`/admin`)**:
   - Simple passcode authentication.
   - **Ad Manager**: Input fields for Sponsor Title, Sponsor Body, Destination Link, and Ad Switch (Active/Inactive).
   - **Cooldown Settings**: Configure default slow mode seconds (e.g. 60s).
   - **Live Metrics**: Total links processed, platform distribution chart (TikTok %, IG %, YT %), and active sponsor click-through estimates.
3. **Stream Proxy (`/api/stream`)**:
   - Proxies video streams with `Content-Disposition: attachment; filename="linkdrop-<platform>-<id>.mp4"` for browsers that default to in-browser playback.

---

## 6. Verification & Testing Strategy

1. **Unit & Route Tests**:
   - Test `/api/extract` with valid and invalid TikTok, Instagram, and YouTube URLs.
   - Verify fallback resolution if primary provider is offline.
2. **Telegram Webhook Verification**:
   - Test mock Telegram update payloads for private chat and group chat scenarios.
   - Verify caption formatting and sponsor link injection.
3. **Cloudflare Compatibility**:
   - Ensure zero Node-only binary dependencies (`ffmpeg-static` etc.) are run in edge runtime; all heavy lifting is URL-delegated.
   - Build validation with `@opennextjs/cloudflare`.


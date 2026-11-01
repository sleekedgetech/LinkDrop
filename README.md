# LinkDrop 🚀

**LinkDrop** is a modern, high-performance, watermark-free media downloader ecosystem built with Next.js 14+ and optimized for **Cloudflare**. It powers both a **Telegram Community Bot** with native 60-second slow mode and dynamic sponsor ad captions, and a **Sleek Web Downloader & Admin Dashboard**.

---

## ✨ Features

- **Zero-Watermark Media Extraction**:
  - **TikTok**: HD clean MP4 video (watermark and outro splash removed) + original audio MP3.
  - **Instagram**: Reels, video posts, and carousel videos.
  - **YouTube**: 1080p / 720p HD videos and 320kbps MP3 audio streams.
  - **Snapchat, Facebook, Twitter/X, Reddit**: Universal media resolution via Cobalt v10 engine.
- **Telegram Community Bot Integration**:
  - Members drop links in the group and receive playable HD video directly in the chat.
  - **Native 60s Slow Mode**: Uses Telegram's built-in group slow mode countdown timer in the user's message bar (`Slow mode: 59... 58... s`).
  - **Zero-Memory Cloudflare Streaming**: Passes extracted clean CDN URLs directly to Telegram's `sendVideo` API so Telegram servers handle file fetching without hitting Cloudflare worker memory limits.
- **Sponsor Ad Engine & Admin Dashboard (`/admin`)**:
  - Dynamically configure sponsor headline, body copy, CTA button, and target destination URL.
  - Stamps sponsor copy on video captions delivered in Telegram groups.
  - Live preview simulating exact Telegram message delivery.
  - Download analytics breakdown (TikTok, Instagram, YouTube, and others).
- **Human-Crafted Aesthetic**:
  - Typography: **Manrope** (`next/font/google`).
  - Dark obsidian & slate theme with 1px tactile borders.
  - Dynamic platform badges (TikTok cyan/magenta, Instagram rose, YouTube red, Snapchat amber).
  - Clean clipboard auto-paste and attachment streaming proxy (`/api/stream`).

---

## 🛠️ Project Structure

```
LinkDrop/
├── app/
│   ├── layout.tsx                   # Layout with Manrope font & dark theme
│   ├── globals.css                  # Obsidian/slate tokens & background grid
│   ├── page.tsx                     # Landing page & web downloader
│   ├── admin/
│   │   └── page.tsx                 # Sponsor ad engine & analytics dashboard
│   └── api/
│       ├── extract/route.ts         # Multi-engine media extraction endpoint
│       ├── stream/route.ts          # Attachment streaming proxy (forces download)
│       ├── telegram/webhook/route.ts# Telegram bot group message & slow-mode webhook
│       └── admin/settings/route.ts  # KV store for active sponsor ads & stats
├── lib/
│   ├── types.ts                     # Types for media results, platforms, and ads
│   ├── extractor/
│   │   ├── index.ts                 # Master extractor with fallback logic
│   │   ├── cobalt.ts                # Cobalt v10 engine resolver
│   │   ├── tikwm.ts                 # TikWM zero-watermark TikTok resolver
│   │   └── platform.ts              # URL parser & platform detector
│   ├── storage/
│   │   └── kv.ts                    # Cloudflare KV & in-memory fallback store
│   └── telegram/
│       └── bot.ts                   # Telegram Bot API client (sendVideo, slow-mode)
├── package.json
└── tailwind.config.ts
```

---

## 🚀 Running Locally

```bash
# Install dependencies
npm install

# Run the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) for the Downloader and [http://localhost:3000/admin](http://localhost:3000/admin) for the Admin Dashboard.

---

## ☁️ Deploying to Cloudflare

LinkDrop runs on Cloudflare Edge with zero heavy binary dependencies.

### 1. Deploy via Cloudflare Pages / Git
1. Push your repository to GitHub or GitLab.
2. In the [Cloudflare Dashboard](https://dash.cloudflare.com/), navigate to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
3. Select the `LinkDrop` repository.
4. Set the build settings:
   - **Framework preset**: `Next.js`
   - **Build command**: `npx @cloudflare/next-on-pages` (or `npm run build`)
   - **Output directory**: `.vercel/output/static` (or default)
5. Add Environment Variables:
   - `TELEGRAM_BOT_TOKEN`: Your token from `@BotFather`.

### 2. Set Telegram Webhook
Once deployed to your Cloudflare domain (e.g. `https://linkdrop.pages.dev`), register your webhook with Telegram:
```bash
curl -F "url=https://linkdrop.pages.dev/api/telegram/webhook" https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook
```
Or simply copy the webhook URL from your LinkDrop Admin Dashboard at `/admin`!


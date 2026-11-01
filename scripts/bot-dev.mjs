/**
 * LinkDrop Local Telegram Bot Runner
 * Allows testing the bot in real Telegram chats/groups directly on localhost without ngrok!
 */

import fs from "fs";
import path from "path";

// Read token from .env.local if exists
let token = process.env.TELEGRAM_BOT_TOKEN;
const envPath = path.join(process.cwd(), ".env.local");

if (!token && fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  const match = content.match(/TELEGRAM_BOT_TOKEN=["']?([^"'\r\n]+)["']?/);
  if (match) token = match[1].trim();
}

if (!token) {
  console.error("\x1b[31m[Error] TELEGRAM_BOT_TOKEN is missing!\x1b[0m");
  console.log("Please create a .env.local file in the project root with:");
  console.log('TELEGRAM_BOT_TOKEN="your_token_from_botfather"\n');
  process.exit(1);
}

const TELEGRAM_API = `https://api.telegram.org/bot${token}`;

async function start() {
  console.log("\x1b[36m⚡ Starting LinkDrop Local Telegram Poller...\x1b[0m");

  // Verify Bot
  try {
    const meRes = await fetch(`${TELEGRAM_API}/getMe`);
    const meData = await meRes.json();
    if (!meData.ok) {
      console.error("\x1b[31m[Error] Invalid bot token:\x1b[0m", meData.description);
      process.exit(1);
    }
    console.log(`\x1b[32m✔ Connected to Telegram as @${meData.result.username} (${meData.result.first_name})\x1b[0m`);

    // Remove any active webhook so polling works locally
    await fetch(`${TELEGRAM_API}/deleteWebhook`);
    console.log("✔ Cleared active webhooks for local polling mode.");
    console.log("\x1b[33m⏳ Listening for messages in private chats & groups...\x1b[0m");
    console.log("👉 Send a TikTok, Instagram, YouTube, or Snapchat link to your bot to test!\n");
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }

  let offset = 0;

  while (true) {
    try {
      const res = await fetch(`${TELEGRAM_API}/getUpdates?offset=${offset}&timeout=30`);
      const data = await res.json();

      if (data.ok && Array.isArray(data.result)) {
        for (const update of data.result) {
          offset = update.update_id + 1;

          // Forward to Next.js webhook endpoint
          try {
            await fetch("http://localhost:3000/api/telegram/webhook", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(update),
            });
          } catch (e) {
            console.error("Failed to forward update to Next.js on http://localhost:3000:", e.message);
          }
        }
      }
    } catch {
      // Reconnect on timeout
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
}

start();


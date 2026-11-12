import { NextResponse } from "next/server";
import {
  getSponsorSettings,
  updateSponsorSettings,
  getBotStats,
  resetBotStats,
} from "@/lib/storage/kv";
import { TelegramBotClient } from "@/lib/telegram/bot";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const [settings, stats] = await Promise.all([getSponsorSettings(), getBotStats()]);
    
    // Also fetch live Telegram bot & webhook health check
    const bot = new TelegramBotClient();
    const [botMe, webhookInfo] = await Promise.all([
      bot.getMe().catch(() => null),
      bot.getWebhookInfo().catch(() => null),
    ]);

    return NextResponse.json({
      settings,
      stats,
      bot: botMe?.result || null,
      webhook: webhookInfo?.result || null,
    });
  } catch {
    return NextResponse.json({ error: "Failed to load admin settings" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();

    // Check for specific actions
    if (body.action === "reset_stats") {
      const wiped = await resetBotStats();
      return NextResponse.json({ success: true, message: "Stats reset successfully", stats: wiped });
    }

    if (body.action === "resync_webhook") {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const origin = body.origin || "https://linkdrop.sleekedgetechsolutions.workers.dev";
      const webhookUrl = `${origin}/api/telegram/webhook`;

      const res = await fetch(`https://api.telegram.org/bot${botToken}/setWebhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: webhookUrl, drop_pending_updates: false }),
      });
      const data = await res.json();
      return NextResponse.json({ success: data.ok, result: data });
    }

    // Default: update sponsor/group settings
    const updated = await updateSponsorSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 400 });
  }
}

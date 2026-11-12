import { NextResponse } from "next/server";
import { extractUrlFromText } from "@/lib/extractor/platform";
import { extractMedia } from "@/lib/extractor";
import { TelegramBotClient } from "@/lib/telegram/bot";
import {
  getSponsorSettings,
  updateSponsorSettings,
  incrementDownloadStats,
  buildViralShareUrl,
} from "@/lib/storage/kv";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const update = await req.json();
    const message = update.message;

    if (!message || !message.text) {
      return NextResponse.json({ ok: true });
    }

    const chat = message.chat;
    const chatId = chat.id;
    const messageId = message.message_id;
    const text = message.text;

    // Check if message contains a link
    const url = extractUrlFromText(text);
    if (!url) {
      if (text === "/start" || text === "/help") {
        const bot = new TelegramBotClient();
        await bot.sendMessage(
          chatId,
          `👋 <b>Welcome to LinkDrop!</b>\n\nDrop any Facebook, TikTok, Instagram, YouTube Shorts, or Snapchat link here to receive it directly in chat.\n\n⏳ <i>Group Slow Mode: 60s per download</i>`,
          messageId
        );
      }
      return NextResponse.json({ ok: true });
    }

    const bot = new TelegramBotClient();
    const adSettings = await getSponsorSettings();

    // Auto-detect group link if the bot is in a group and groupInviteUrl is not yet set
    const isGroup = chat.type === "group" || chat.type === "supergroup";
    if (isGroup && !adSettings.groupInviteUrl) {
      let detectedGroupUrl = chat.username ? `https://t.me/${chat.username}` : "";
      if (!detectedGroupUrl) {
        const exported = await bot.exportChatInviteLink(chatId);
        if (exported && exported.ok && exported.result) {
          detectedGroupUrl = exported.result;
        }
      }
      if (detectedGroupUrl) {
        adSettings.groupInviteUrl = detectedGroupUrl;
        await updateSponsorSettings({ groupInviteUrl: detectedGroupUrl });
      }
    }

    // Configure the viral share link to point to the GROUP, not the bot
    if (adSettings.groupInviteUrl && (adSettings.shareTarget === "group" || !adSettings.clickUrl)) {
      adSettings.clickUrl = buildViralShareUrl(adSettings.groupInviteUrl);
    }

    // 1. Send instant chat action (shows "uploading video..." in Telegram header)
    bot.sendChatAction(chatId, "upload_video");

    // 2. Send instant feedback message so user knows the bot is working
    let progressMessageId: number | null = null;
    try {
      const progressMsg = await bot.sendMessage(
        chatId,
        `⚡ <b>Processing video for Telegram...</b>\n<i>Downloading and delivering directly to this chat, please wait...</i>`,
        messageId
      );
      if (progressMsg && progressMsg.result) {
        progressMessageId = progressMsg.result.message_id;
      }
    } catch {
      // Non-fatal
    }

    try {
      const media = await extractMedia(url);
      await incrementDownloadStats(media.platform, media.title);

      let caption = `✨ <b>Downloaded via LinkDrop</b>\n\n`;
      if (media.title) {
        caption += `🎬 <i>${media.title.substring(0, 80)}</i>\n\n`;
      }

      if (adSettings.enabled) {
        const buttonLabel = adSettings.buttonText || "📲 Share Group with Friends";
        const shareLink = adSettings.clickUrl || adSettings.groupInviteUrl || "https://t.me";
        caption += `📢 <b>${adSettings.title}</b>\n${adSettings.body}\n<a href="${shareLink}">👉 ${buttonLabel}</a>\n\n`;
      }

      caption += `⏳ <i>Slow mode active: ${adSettings.slowModeSeconds || 60}s countdown</i>`;

      const sent = await bot.sendVideo(chatId, media.downloadUrl, caption, messageId, adSettings);

      // Clean up the temporary "working on your video..." progress message
      if (progressMessageId) {
        await bot.deleteMessage(chatId, progressMessageId);
      }

      // If Telegram rejected direct delivery (e.g. >50MB)
      if (!sent.ok) {
        const isTooBig =
          sent.description?.toLowerCase().includes("too big") ||
          sent.description?.toLowerCase().includes("too large");
        await bot.sendMessage(
          chatId,
          `⚠️ <b>Delivery Notice:</b>\n\n${
            isTooBig
              ? "This video exceeds Telegram's 50MB direct bot streaming limit."
              : "Unable to deliver this video directly into Telegram. Please check that the link is public and under 50MB."
          }`,
          messageId
        );
      }
    } catch (err: any) {
      // Clean up progress message on error
      if (progressMessageId) {
        await bot.deleteMessage(chatId, progressMessageId);
      }

      await bot.sendMessage(
        chatId,
        `❌ <b>Download Notice:</b> ${err.message || "Failed to extract clean media."}`,
        messageId
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}

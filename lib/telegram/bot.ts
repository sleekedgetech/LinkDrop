import { SponsorAdSettings } from "../types";

const TELEGRAM_API_BASE = "https://api.telegram.org";

export class TelegramBotClient {
  private token: string;

  constructor(token?: string) {
    this.token = token || process.env.TELEGRAM_BOT_TOKEN || "";
  }

  async sendVideo(
    chatId: number | string,
    videoUrl: string,
    caption: string,
    replyToMessageId?: number,
    sponsorAd?: SponsorAdSettings
  ) {
    const inlineKeyboard: any[][] = [];

    if (sponsorAd && sponsorAd.enabled) {
      if (sponsorAd.shareTarget === "custom" && sponsorAd.clickUrl) {
        // Custom external sponsor/destination button
        inlineKeyboard.push([
          {
            text: sponsorAd.buttonText || "👉 Visit Website",
            url: sponsorAd.clickUrl,
          },
        ]);
      } else {
        // Multi-platform viral sharing (Telegram, WhatsApp, and 1-tap Copy)
        const groupUrl = sponsorAd.groupInviteUrl || sponsorAd.clickUrl || "https://t.me";
        const shareText =
          "Download Facebook, TikTok & Instagram videos without watermark for free in our group!";
        const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(groupUrl)}&text=${encodeURIComponent(shareText)}`;
        const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(`${shareText} Join here: ${groupUrl}`)}`;

        // Row 1: Share to Telegram & WhatsApp
        inlineKeyboard.push([
          { text: "📲 Telegram", url: telegramShareUrl },
          { text: "💬 WhatsApp", url: whatsappShareUrl },
        ]);

        // Row 2: One-tap copy button (Telegram Bot API 7.8 native copy_text)
        inlineKeyboard.push([
          {
            text: "📋 Copy Group Invite Link",
            copy_text: { text: groupUrl },
          },
        ]);
      }
    }

    // 1. First attempt: Stream/Download binary and upload via multipart/form-data.
    // This bypasses CDN blocks where Meta/YouTube block Telegram's datacenter IPs.
    try {
      const videoRes = await fetch(videoUrl, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          Referer: "https://www.google.com/",
        },
        signal: AbortSignal.timeout(30000),
      });

      if (videoRes.ok) {
        const arrayBuffer = await videoRes.arrayBuffer();
        // Telegram Bot API limit for multipart uploads is 50MB
        if (arrayBuffer.byteLength > 0 && arrayBuffer.byteLength <= 50 * 1024 * 1024) {
          const blob = new Blob([arrayBuffer], { type: "video/mp4" });
          const formData = new FormData();
          formData.append("chat_id", String(chatId));
          formData.append("video", blob, "video.mp4");
          formData.append("caption", caption);
          formData.append("parse_mode", "HTML");
          formData.append("supports_streaming", "true");

          if (replyToMessageId) {
            formData.append("reply_to_message_id", String(replyToMessageId));
          }

          if (inlineKeyboard.length > 0) {
            formData.append(
              "reply_markup",
              JSON.stringify({ inline_keyboard: inlineKeyboard })
            );
          }

          const res = await fetch(`${TELEGRAM_API_BASE}/bot${this.token}/sendVideo`, {
            method: "POST",
            body: formData,
          });

          const result = await res.json();
          if (result && result.ok) {
            return result;
          }
        }
      }
    } catch (e: any) {
      console.warn("Direct binary upload attempt encountered an issue:", e?.message || e);
    }

    // 2. Fallback attempt: Standard URL-based sendVideo
    const fallbackRes = await fetch(`${TELEGRAM_API_BASE}/bot${this.token}/sendVideo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        video: videoUrl,
        caption: caption,
        parse_mode: "HTML",
        supports_streaming: true,
        reply_to_message_id: replyToMessageId,
        reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
      }),
    });

    return await fallbackRes.json();
  }

  async sendMessage(chatId: number | string, text: string, replyToMessageId?: number) {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${this.token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        reply_to_message_id: replyToMessageId,
      }),
    });
    return await res.json();
  }

  async sendChatAction(chatId: number | string, action: string = "upload_video") {
    try {
      await fetch(`${TELEGRAM_API_BASE}/bot${this.token}/sendChatAction`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, action }),
      });
    } catch {
      // Ignore action errors
    }
  }

  async deleteMessage(chatId: number | string, messageId: number) {
    try {
      await fetch(`${TELEGRAM_API_BASE}/bot${this.token}/deleteMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, message_id: messageId }),
      });
    } catch {
      // Ignore delete errors
    }
  }

  async setChatSlowModeDelay(chatId: number | string, seconds: number = 60) {
    const res = await fetch(`${TELEGRAM_API_BASE}/bot${this.token}/setChatSlowModeDelay`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        slow_mode_delay: seconds,
      }),
    });
    return await res.json();
  }

  async getChat(chatId: number | string) {
    try {
      const res = await fetch(`${TELEGRAM_API_BASE}/bot${this.token}/getChat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId }),
      });
      return await res.json();
    } catch {
      return null;
    }
  }

  async exportChatInviteLink(chatId: number | string) {
    try {
      const res = await fetch(`${TELEGRAM_API_BASE}/bot${this.token}/exportChatInviteLink`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId }),
      });
      return await res.json();
    } catch {
      return null;
    }
  }

  async getWebhookInfo() {
    try {
      const res = await fetch(`${TELEGRAM_API_BASE}/bot${this.token}/getWebhookInfo`);
      return await res.json();
    } catch {
      return null;
    }
  }

  async getMe() {
    try {
      const res = await fetch(`${TELEGRAM_API_BASE}/bot${this.token}/getMe`);
      return await res.json();
    } catch {
      return null;
    }
  }
}

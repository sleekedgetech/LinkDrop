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
    const inlineKeyboard =
      sponsorAd && sponsorAd.enabled
        ? [
            [
              {
                text: sponsorAd.buttonText || "🚀 Check Sponsor",
                url: sponsorAd.clickUrl || "https://t.me",
              },
            ],
          ]
        : [];

    const res = await fetch(`${TELEGRAM_API_BASE}/bot${this.token}/sendVideo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        video: videoUrl,
        caption: caption,
        parse_mode: "HTML",
        reply_to_message_id: replyToMessageId,
        reply_markup: inlineKeyboard.length > 0 ? { inline_keyboard: inlineKeyboard } : undefined,
      }),
    });

    return await res.json();
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
}


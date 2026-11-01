import { SupportedPlatform } from "../types";

export function detectPlatform(url: string): SupportedPlatform {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("youtube.com") || host.includes("youtu.be")) return "youtube";
    if (host.includes("snapchat.com")) return "snapchat";
    if (host.includes("facebook.com") || host.includes("fb.watch")) return "facebook";
    if (host.includes("twitter.com") || host.includes("x.com")) return "twitter";
    if (host.includes("reddit.com")) return "reddit";

    return "unknown";
  } catch {
    return "unknown";
  }
}

export function extractUrlFromText(text: string): string | null {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const matches = text.match(urlRegex);
  return matches && matches.length > 0 ? matches[0] : null;
}


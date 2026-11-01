import { ExtractedMedia } from "../types";
import { detectPlatform } from "./platform";
import { extractTikTok } from "./tikwm";
import { extractCobalt } from "./cobalt";

export async function extractMedia(url: string): Promise<ExtractedMedia> {
  const platform = detectPlatform(url);

  // TikTok specialized zero-watermark engine first
  if (platform === "tiktok") {
    const tikwmResult = await extractTikTok(url);
    if (tikwmResult) return tikwmResult;
  }

  // Universal Cobalt engine for YouTube, Instagram, Snapchat, Facebook, X, etc.
  const cobaltResult = await extractCobalt(url, platform);
  if (cobaltResult) return cobaltResult;

  // Fallback attempt with TikWM if not already tried (some shortlinks redirect)
  if (platform !== "tiktok") {
    const fallbackTik = await extractTikTok(url);
    if (fallbackTik) return fallbackTik;
  }

  throw new Error(
    `Unable to extract media from this ${platform === "unknown" ? "link" : platform + " link"}. Please verify that the post is public.`
  );
}


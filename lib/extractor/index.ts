import { ExtractedMedia } from "../types";
import { detectPlatform } from "./platform";
import { extractTikTok } from "./tikwm";
import { extractFacebook } from "./facebook";
import { extractInstagram } from "./instagram";
import { extractYouTube } from "./youtube";
import { extractCobalt } from "./cobalt";
import { extractYtDlp } from "./ytdlp";

export async function extractMedia(url: string): Promise<ExtractedMedia> {
  const platform = detectPlatform(url);

  // TikTok specialized zero-watermark engine first
  if (platform === "tiktok") {
    const tikwmResult = await extractTikTok(url);
    if (tikwmResult) return tikwmResult;
  }

  // Facebook specialized native edge engine
  if (platform === "facebook") {
    const fbResult = await extractFacebook(url);
    if (fbResult) return fbResult;
  }

  // Instagram specialized native edge engine
  if (platform === "instagram") {
    const igResult = await extractInstagram(url);
    if (igResult) return igResult;
  }

  // YouTube Shorts / video specialized native edge engine
  if (platform === "youtube") {
    const ytResult = await extractYouTube(url);
    if (ytResult) return ytResult;
  }

  // Fallback: yt-dlp (works if running on node/server environment with Python)
  const ytdlResult = await extractYtDlp(url, platform);
  if (ytdlResult) return ytdlResult;

  // Instagram attempt on unknown/shared links
  if (platform !== "instagram") {
    const igFallback = await extractInstagram(url);
    if (igFallback) return igFallback;
  }

  // YouTube attempt on unknown/shared links
  if (platform !== "youtube") {
    const ytFallback = await extractYouTube(url);
    if (ytFallback) return ytFallback;
  }

  // Fallback attempt with Facebook scraper for unknown or shortlinks
  if (platform !== "facebook") {
    const fbFallback = await extractFacebook(url);
    if (fbFallback) return fbFallback;
  }

  // Fallback attempt with TikWM if not already tried (some shortlinks redirect)
  if (platform !== "tiktok") {
    const fallbackTik = await extractTikTok(url);
    if (fallbackTik) return fallbackTik;
  }

  // Universal Cobalt engine fallback
  const cobaltResult = await extractCobalt(url, platform);
  if (cobaltResult) return cobaltResult;

  throw new Error(
    `Unable to extract media from this ${platform === "unknown" ? "link" : platform + " link"}. Please verify that the post is public.`
  );
}

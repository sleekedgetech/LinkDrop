import { ExtractedMedia, SupportedPlatform } from "../types";

export async function extractYtDlp(url: string, platform: SupportedPlatform): Promise<ExtractedMedia | null> {
  try {
    // Dynamic import to safely handle Edge / Serverless environments (like Cloudflare)
    const cp = await import("child_process").catch(() => null);
    if (!cp || typeof cp.execFile !== "function") {
      console.warn("yt-dlp is not available in this edge environment. Requires server with Python & yt-dlp installed.");
      return null;
    }
    const { promisify } = await import("util");
    const execFileAsync = promisify(cp.execFile);

    // Single fast execution with mobile player clients to bypass YouTube bot detection
    const args = [
      "-m",
      "yt_dlp",
      "--no-playlist",
      "--no-warnings",
      "-j",
    ];

    if (platform === "youtube") {
      args.push("--extractor-args", "youtube:player_client=android,ios");
    }

    args.push(url);

    const { stdout: jsonOut } = await execFileAsync("python", args, {
      maxBuffer: 30 * 1024 * 1024,
      timeout: 25000,
    });

    const data = JSON.parse(jsonOut);
    if (!data || !data.formats) return null;

    const formats = data.formats;

    // 1. Find best playable video stream (preferably with audio merged)
    // First try progressive MP4 (audio + video together)
    const progressiveMp4 = formats
      .filter(
        (f: any) =>
          f.url &&
          f.ext === "mp4" &&
          f.vcodec !== "none" &&
          f.acodec !== "none" &&
          !f.url.includes("manifest")
      )
      .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

    // Fallback: any video stream with a direct URL
    const videoOnly = formats
      .filter((f: any) => f.url && f.vcodec !== "none" && !f.url.includes("manifest"))
      .sort((a: any, b: any) => (b.height || 0) - (a.height || 0));

    // Audio-only stream
    const audioStreams = formats
      .filter(
        (f: any) =>
          f.url &&
          f.vcodec === "none" &&
          f.acodec !== "none" &&
          !f.url.includes("manifest")
      )
      .sort((a: any, b: any) => (b.abr || 0) - (a.abr || 0));

    const bestVideo = progressiveMp4[0] || videoOnly[0];
    const bestAudio = audioStreams[0];

    const videoUrl = bestVideo?.url || data.url;
    const audioUrl = bestAudio?.url;

    if (!videoUrl && !audioUrl) {
      return null;
    }

    const options = [];
    if (bestVideo && bestVideo.url) {
      const resLabel = bestVideo.height ? `${bestVideo.height}p HD` : "HD Video";
      options.push({
        quality: `${resLabel} (Clean MP4)`,
        format: "mp4" as const,
        url: bestVideo.url,
      });
    }

    // Add additional resolutions if available
    if (progressiveMp4.length > 1) {
      const secondOption = progressiveMp4[1];
      if (secondOption && secondOption.url && secondOption.url !== bestVideo?.url) {
        options.push({
          quality: `${secondOption.height || 480}p SD (Clean MP4)`,
          format: "mp4" as const,
          url: secondOption.url,
        });
      }
    }

    if (bestAudio && bestAudio.url) {
      options.push({
        quality: `Audio Stream (${Math.round(bestAudio.abr || 128)}kbps MP3)`,
        format: "mp3" as const,
        url: bestAudio.url,
        isAudioOnly: true,
      });
    }

    return {
      platform,
      originalUrl: url,
      title: data.title || `${platform.toUpperCase()} Media`,
      author: data.uploader || data.channel || data.creator,
      thumbnail: data.thumbnail,
      duration: data.duration,
      downloadUrl: videoUrl || audioUrl,
      audioUrl: audioUrl,
      options: options.length > 0 ? options : [
        {
          quality: "HD Stream (MP4)",
          format: "mp4" as const,
          url: videoUrl,
        }
      ],
    };
  } catch (err: any) {
    console.error("Fast yt-dlp extraction error:", err?.message || err);
    return null;
  }
}

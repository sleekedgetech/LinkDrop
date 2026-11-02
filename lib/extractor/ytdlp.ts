import { execFile } from "child_process";
import { promisify } from "util";
import { ExtractedMedia, SupportedPlatform } from "../types";

const execFileAsync = promisify(execFile);

export async function extractYtDlp(url: string, platform: SupportedPlatform): Promise<ExtractedMedia | null> {
  try {
    // 1. Get metadata JSON
    const { stdout: jsonOut } = await execFileAsync(
      "python",
      ["-m", "yt_dlp", "-j", "--no-playlist", "--no-warnings", url],
      { maxBuffer: 25 * 1024 * 1024 }
    );

    const data = JSON.parse(jsonOut);
    if (!data) return null;

    // 2. Resolve direct downloadable stream URLs
    let videoStreamUrl = "";
    let audioStreamUrl = "";

    try {
      const { stdout: gOut } = await execFileAsync(
        "python",
        ["-m", "yt_dlp", "-g", "-f", "best[ext=mp4]/best", "--no-playlist", url],
        { maxBuffer: 5 * 1024 * 1024 }
      );
      videoStreamUrl = gOut.trim().split("\n")[0];
    } catch {
      // Fallback to format list
      const mp4Format = data.formats?.find(
        (f: any) => f.url && f.ext === "mp4" && f.vcodec !== "none"
      );
      if (mp4Format) videoStreamUrl = mp4Format.url;
    }

    try {
      const { stdout: aOut } = await execFileAsync(
        "python",
        ["-m", "yt_dlp", "-g", "-f", "ba/bestaudio", "--no-playlist", url],
        { maxBuffer: 5 * 1024 * 1024 }
      );
      audioStreamUrl = aOut.trim().split("\n")[0];
    } catch {
      // Optional audio fallback
    }

    if (!videoStreamUrl && !audioStreamUrl) {
      return null;
    }

    const options = [];
    if (videoStreamUrl) {
      options.push({
        quality: "HD Video (Clean MP4)",
        format: "mp4" as const,
        url: videoStreamUrl,
      });
    }

    if (audioStreamUrl) {
      options.push({
        quality: "Audio Stream (MP3)",
        format: "mp3" as const,
        url: audioStreamUrl,
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
      downloadUrl: videoStreamUrl || audioStreamUrl,
      audioUrl: audioStreamUrl,
      options,
    };
  } catch (err: any) {
    console.error("yt-dlp extraction failed:", err?.message || err);
    return null;
  }
}


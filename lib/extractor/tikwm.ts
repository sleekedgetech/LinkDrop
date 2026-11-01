import { ExtractedMedia } from "../types";

export async function extractTikTok(url: string): Promise<ExtractedMedia | null> {
  try {
    const res = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
      body: new URLSearchParams({ url, count: "12", cursor: "0", web: "1", hd: "1" }),
    });

    if (!res.ok) return null;

    const data = await res.json();
    if (data.code !== 0 || !data.data) {
      return null;
    }

    const d = data.data;
    const cleanVideoUrl = d.hdplay || d.play;

    return {
      platform: "tiktok",
      originalUrl: url,
      title: d.title || "TikTok Video",
      author: d.author?.unique_id || d.author?.nickname,
      thumbnail: d.cover,
      duration: d.duration,
      downloadUrl: cleanVideoUrl,
      audioUrl: d.music,
      options: [
        {
          quality: "HD (No Watermark)",
          format: "mp4",
          url: cleanVideoUrl,
        },
        ...(d.music
          ? [
              {
                quality: "Audio Original (MP3)",
                format: "mp3" as const,
                url: d.music,
                isAudioOnly: true,
              },
            ]
          : []),
      ],
    };
  } catch (err) {
    console.error("TikWM extraction error:", err);
    return null;
  }
}


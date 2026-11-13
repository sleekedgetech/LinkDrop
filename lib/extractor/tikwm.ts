import { ExtractedMedia } from "../types";

export async function extractTikTok(url: string): Promise<ExtractedMedia | null> {
  // Tier 1: TikWM API Engine
  try {
    const res = await fetch("https://www.tikwm.com/api/", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
      },
      body: new URLSearchParams({ url, count: "12", cursor: "0", web: "1", hd: "1" }),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.code === 0 && data.data) {
        const d = data.data;
        // Prioritize d.play as d.hdplay can throw 503 or CDN rate limits
        let cleanVideoUrl = d.play || d.hdplay || d.wmplay;
        if (cleanVideoUrl && cleanVideoUrl.startsWith("/")) {
          cleanVideoUrl = `https://www.tikwm.com${cleanVideoUrl}`;
        }

        let coverUrl = d.cover;
        if (coverUrl && coverUrl.startsWith("/")) {
          coverUrl = `https://www.tikwm.com${coverUrl}`;
        }

        let musicUrl = d.music;
        if (musicUrl && musicUrl.startsWith("/")) {
          musicUrl = `https://www.tikwm.com${musicUrl}`;
        }

        if (cleanVideoUrl && cleanVideoUrl.startsWith("http")) {
          return {
            platform: "tiktok",
            originalUrl: url,
            title: d.title || "TikTok Video",
            author: d.author?.unique_id || d.author?.nickname,
            thumbnail: coverUrl,
            duration: d.duration,
            downloadUrl: cleanVideoUrl,
            audioUrl: musicUrl,
            options: [
              {
                quality: "HD (No Watermark)",
                format: "mp4",
                url: cleanVideoUrl,
              },
              ...(musicUrl
                ? [
                    {
                      quality: "Audio Original (MP3)",
                      format: "mp3" as const,
                      url: musicUrl,
                      isAudioOnly: true,
                    },
                  ]
                : []),
            ],
          };
        }
      }
    }
  } catch (err) {
    console.warn("TikWM tier 1 error, trying tier 2:", err);
  }

  // Tier 2: SSSTik High-Speed Fallback Engine
  try {
    const body = new URLSearchParams({
      id: url,
      locale: "en",
      tt: "dHl6Ylg4",
    });

    const sssRes = await fetch("https://ssstik.io/abc?url=dl", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: "https://ssstik.io/en-1",
        "hx-request": "true",
        "hx-target": "target",
        "hx-trigger": "_gcaptcha_pt",
      },
      body: body.toString(),
      signal: AbortSignal.timeout(8000),
    });

    if (sssRes.ok) {
      const html = await sssRes.text();
      const directLinks = Array.from(html.matchAll(/href="(https:\/\/[^"]+)"/g)).map((m) => m[1]);
      const cleanDownload = directLinks.find(
        (u) => u.includes("tikcdn") || u.includes(".mp4") || u.includes("ssstik")
      );

      const titleMatch = html.match(/<h2[^>]*>(.*?)<\/h2>/i);
      const title = titleMatch ? titleMatch[1].replace(/<[^>]+>/g, "").trim() : "TikTok Video";

      const thumbMatch = html.match(/class="result_author"[^>]+src="([^"]+)"/i);
      const thumbnail = thumbMatch ? thumbMatch[1] : undefined;

      if (cleanDownload) {
        return {
          platform: "tiktok",
          originalUrl: url,
          title,
          thumbnail,
          downloadUrl: cleanDownload,
          options: [
            {
              quality: "HD (Clean Stream)",
              format: "mp4",
              url: cleanDownload,
            },
          ],
        };
      }
    }
  } catch (err) {
    console.error("SSSTik tier 2 error:", err);
  }

  return null;
}

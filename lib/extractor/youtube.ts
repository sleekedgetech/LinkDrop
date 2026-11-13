import { ExtractedMedia, MediaDownloadOption } from "../types";

export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export async function extractYouTube(url: string): Promise<ExtractedMedia | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  // 1. Direct Invidious Proxy Stream (Bypasses googlevideo IP blocks)
  const invidiousHosts = [
    "https://yt.chocolatemoo53.com",
    "https://inv.bp.projectsegfau.lt",
    "https://invidious.jing.rocks",
    "https://invidious.nerdvpn.de",
  ];

  for (const host of invidiousHosts) {
    try {
      const infoRes = await fetch(`${host}/api/v1/videos/${videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(5000),
      });

      if (infoRes.ok) {
        const data = await infoRes.json();
        // Construct direct stream proxy URL that works on any IP
        const streamUrl = `${host}/latest_version?id=${videoId}&itag=18`;

        return {
          platform: "youtube",
          originalUrl: url,
          title: data.title || "YouTube Video",
          author: data.author,
          thumbnail: data.videoThumbnails?.[0]?.url,
          duration: data.lengthSeconds,
          downloadUrl: streamUrl,
          options: [
            {
              quality: "720p HD (Clean Stream)",
              format: "mp4",
              url: streamUrl,
            },
          ],
        };
      }
    } catch {
      // Continue to next
    }
  }

  // 2. Piped API instances
  const pipedHosts = [
    "https://api.piped.private.coffee",
    "https://pipedapi.ducks.party",
    "https://pipedapi.leptons.xyz",
  ];

  for (const host of pipedHosts) {
    try {
      const res = await fetch(`${host}/streams/${videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(5000),
      });

      if (res.ok) {
        const data = await res.json();
        const vStreams = (data.videoStreams || []).filter((v: any) => v.url);
        const muxed =
          vStreams.find((v: any) => !v.videoOnly && v.format === "MPEG_4") ||
          vStreams.find((v: any) => v.format === "MPEG_4") ||
          vStreams[0];

        if (muxed && muxed.url) {
          return {
            platform: "youtube",
            originalUrl: url,
            title: data.title || "YouTube Video",
            author: data.uploader,
            thumbnail: data.thumbnailUrl,
            duration: data.duration,
            downloadUrl: muxed.url,
            options: [
              {
                quality: muxed.quality || "HD",
                format: "mp4",
                url: muxed.url,
              },
            ],
          };
        }
      }
    } catch {
      // Continue
    }
  }

  // 3. Fast Edge MP4 API Fallback
  try {
    const res = await fetch(
      `https://nntech-free-yt-api.vercel.app/api/download/mp4?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(6000) }
    );
    if (res.ok) {
      const data = await res.json();
      if (data && data.download) {
        return {
          platform: "youtube",
          originalUrl: url,
          title: data.title || "YouTube Video",
          thumbnail: data.thumbnail,
          downloadUrl: data.download,
          options: [
            {
              quality: "HD Clean Stream",
              format: "mp4",
              url: data.download,
            },
          ],
        };
      }
    }
  } catch {
    //
  }

  return null;
}

import { ExtractedMedia, MediaDownloadOption } from "../types";

export function extractYouTubeId(url: string): string | null {
  const match = url.match(/(?:shorts\/|v=|youtu\.be\/|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

export async function extractYouTube(url: string): Promise<ExtractedMedia | null> {
  const videoId = extractYouTubeId(url);
  if (!videoId) return null;

  // 1. Invidious API instances (Pure JSON REST, edge-compatible)
  const invidiousHosts = [
    "https://yt.chocolatemoo53.com",
    "https://inv.bp.projectsegfau.lt",
    "https://invidious.jing.rocks",
    "https://invidious.nerdvpn.de",
  ];

  for (const host of invidiousHosts) {
    try {
      const res = await fetch(`${host}/api/v1/videos/${videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        // Check for progressive formatStreams (audio + video muxed)
        const formatStreams = (data.formatStreams || []).filter(
          (f: any) => f.url && (f.container === "mp4" || f.type?.includes("mp4"))
        );

        // Or adaptive formats
        const adaptiveMp4 = (data.adaptiveFormats || []).filter(
          (f: any) => f.url && f.type?.startsWith("video/mp4")
        );

        const chosenStream = formatStreams[0] || adaptiveMp4[0];
        if (chosenStream && chosenStream.url) {
          const options: MediaDownloadOption[] = [];
          
          for (const s of formatStreams) {
            options.push({
              quality: s.qualityLabel || s.resolution || "HD",
              format: "mp4",
              url: s.url,
            });
          }

          if (options.length === 0 && chosenStream) {
            options.push({
              quality: chosenStream.qualityLabel || "HD",
              format: "mp4",
              url: chosenStream.url,
            });
          }

          return {
            platform: "youtube",
            originalUrl: url,
            title: data.title || "YouTube Video",
            author: data.author,
            thumbnail: data.videoThumbnails?.[0]?.url,
            duration: data.lengthSeconds,
            downloadUrl: chosenStream.url,
            options,
          };
        }
      }
    } catch {
      // Continue to next host
    }
  }

  // 2. Piped API instances fallback
  const pipedHosts = [
    "https://api.piped.private.coffee",
    "https://pipedapi.ducks.party",
    "https://pipedapi.leptons.xyz",
  ];

  for (const host of pipedHosts) {
    try {
      const res = await fetch(`${host}/streams/${videoId}`, {
        headers: { "User-Agent": "Mozilla/5.0" },
        signal: AbortSignal.timeout(6000),
      });

      if (res.ok) {
        const data = await res.json();
        const vStreams = (data.videoStreams || []).filter((v: any) => v.url);
        // Prefer muxed mp4 stream
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
      // Continue to next host
    }
  }

  // 3. Fallback: Rapid public edge resolver
  try {
    const res = await fetch(
      `https://nntech-free-yt-api.vercel.app/api/download/mp4?url=${encodeURIComponent(url)}`,
      { signal: AbortSignal.timeout(8000) }
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
              quality: "HD",
              format: "mp4",
              url: data.download,
            },
          ],
        };
      }
    }
  } catch {
    // Ignore error
  }

  return null;
}


import { ExtractedMedia, SupportedPlatform } from "../types";

const PUBLIC_COBALT_INSTANCES = [
  "https://api.cobalt.tools",
  "https://cobalt-api.kwiatekm.tokyo",
  "https://cobalt.api.timelessroses.world",
];

export async function extractCobalt(
  url: string,
  platform: SupportedPlatform
): Promise<ExtractedMedia | null> {
  for (const instance of PUBLIC_COBALT_INSTANCES) {
    try {
      const response = await fetch(`${instance}/`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          "User-Agent": "LinkDrop/1.0",
        },
        body: JSON.stringify({
          url,
          videoQuality: "1080",
          filenameStyle: "pretty",
          downloadMode: "auto",
        }),
      });

      if (!response.ok) continue;

      const data = await response.json();
      const streamUrl = data.url;

      if (streamUrl) {
        return {
          platform,
          originalUrl: url,
          title: `${platform.toUpperCase()} Video (Clean)`,
          downloadUrl: streamUrl,
          options: [
            {
              quality: "HD 1080p (No Watermark)",
              format: "mp4",
              url: streamUrl,
            },
          ],
        };
      }
    } catch {
      continue;
    }
  }
  return null;
}


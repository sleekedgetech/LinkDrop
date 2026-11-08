import { ExtractedMedia, MediaDownloadOption } from "../types";

/**
 * SnapSave algorithm unpacker / deobfuscator
 */
function decodeSnapApp(h: string, u: number, n: string, t: number, e: number, r: number): string {
  const _0xc1e = [
    "",
    "split",
    "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ+/",
    "slice",
    "indexOf",
    "",
    "",
    ".",
    "pow",
    "reduce",
    "reverse",
    "0"
  ];

  function _0xe44c(d: string, eVal: number, fVal: number) {
    const g = _0xc1e[2].split(_0xc1e[0]);
    const hArr = g.slice(0, eVal);
    const iArr = g.slice(0, fVal);
    let j = d
      .split(_0xc1e[0])
      .reverse()
      .reduce((a: number, b: string, c: number) => {
        if (hArr.indexOf(b) !== -1) {
          return (a += hArr.indexOf(b) * Math.pow(eVal, c));
        }
        return a;
      }, 0);

    let k = _0xc1e[0];
    while (j > 0) {
      k = iArr[j % fVal] + k;
      j = Math.floor((j - (j % fVal)) / fVal);
    }
    return k || _0xc1e[11];
  }

  let result = "";
  for (let i = 0, len = h.length; i < len; i++) {
    let s = "";
    while (h[i] !== n[e]) {
      s += h[i];
      i++;
    }
    for (let j = 0; j < n.length; j++) {
      s = s.replace(new RegExp(n[j], "g"), j.toString());
    }
    result += String.fromCharCode(Number(_0xe44c(s, e, 10)) - t);
  }

  try {
    return decodeURIComponent(escape(result));
  } catch {
    return result;
  }
}

/**
 * Safely decodes base64 payload from JWT token to extract direct CDN URL
 */
function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
      base64 += "=";
    }

    let decodedStr = "";
    if (typeof atob === "function") {
      decodedStr = atob(base64);
    } else if (typeof Buffer !== "undefined") {
      decodedStr = Buffer.from(base64, "base64").toString("utf-8");
    }

    return JSON.parse(decodedStr);
  } catch {
    return null;
  }
}

/**
 * Parse the decoded HTML returned by SnapSave
 */
function parseSnapSaveHtml(rawHtml: string, originalUrl: string): ExtractedMedia | null {
  // Normalize escaped quotes and slashes from JS innerHTML assignment
  const html = rawHtml
    .replace(/\\"/g, '"')
    .replace(/\\'/g, "'")
    .replace(/\\\//g, "/");

  // Extract thumbnail
  const thumbMatch = html.match(/<img[^>]+src="([^"]+)"/i);
  let thumbnail = thumbMatch ? thumbMatch[1].replace(/&amp;/g, "&") : undefined;
  if (thumbnail && thumbnail.includes("token=")) {
    const token = thumbnail.split("token=")[1]?.split("&")[0];
    const payload = token ? decodeJwtPayload(token) : null;
    if (payload?.url) {
      thumbnail = payload.url;
    }
  }

  // Extract title
  const titleMatch = html.match(/<strong>(.*?)<\/strong>/i) || html.match(/<span class="video-des">(.*?)<\/span>/i);
  let title = titleMatch ? titleMatch[1].trim() : "Facebook Video";
  if (title === "..." || !title) {
    title = "Facebook Video";
  }

  // Find all download buttons/links inside tbody
  const options: MediaDownloadOption[] = [];
  const tbodyMatch = html.match(/<tbody>([\s\S]*?)<\/tbody>/i);
  const searchArea = tbodyMatch ? tbodyMatch[1] : html;

  const rowRegex = /<tr[^>]*>([\s\S]*?)<\/tr>/gi;
  let row: RegExpExecArray | null;
  while ((row = rowRegex.exec(searchArea)) !== null) {
    const rowHtml = row[1];
    const qualityMatch = rowHtml.match(/class="video-quality"[^>]*>([^<]+)<\/td>/i);
    const linkMatch = rowHtml.match(/<a[^>]+href="(https?:\/\/[^"]+)"[^>]*>/i);

    if (linkMatch) {
      const rawDownloadUrl = linkMatch[1].replace(/&amp;/g, "&");
      const quality = qualityMatch ? qualityMatch[1].trim() : "HD";

      // If downloadUrl has a JWT token containing direct Facebook CDN URL, resolve direct URL
      let directUrl = rawDownloadUrl;
      if (rawDownloadUrl.includes("token=")) {
        const token = rawDownloadUrl.split("token=")[1]?.split("&")[0];
        const payload = token ? decodeJwtPayload(token) : null;
        if (payload?.url) {
          directUrl = payload.url;
        }
      }

      options.push({
        quality,
        format: "mp4",
        url: directUrl || rawDownloadUrl
      });
    }
  }

  // Fallback: look for direct media links if table parsing found nothing
  if (options.length === 0) {
    const linkRegex = /href="(https:\/\/[^"]*(?:rapidcdn\.app|fbcdn\.net)[^"]*)"/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null) {
      const u = m[1].replace(/&amp;/g, "&");
      if (!options.some((o) => o.url === u)) {
        options.push({
          quality: "HD",
          format: "mp4",
          url: u
        });
      }
    }
  }

  if (options.length === 0) {
    return null;
  }

  // Best download URL is HD or 720p/1080p if available
  const bestOption =
    options.find(
      (o) =>
        o.quality.toLowerCase().includes("hd") ||
        o.quality.toLowerCase().includes("720") ||
        o.quality.toLowerCase().includes("1080")
    ) || options[0];

  return {
    platform: "facebook",
    originalUrl,
    title,
    thumbnail,
    downloadUrl: bestOption.url,
    options
  };
}

/**
 * Extracts Facebook video using zero-cost serverless edge decoder
 */
export async function extractFacebook(url: string): Promise<ExtractedMedia | null> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 12000);

  try {
    const res = await fetch("https://snapsave.app/action.php", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://snapsave.app/"
      },
      body: new URLSearchParams({ url }),
      signal: controller.signal
    });

    if (!res.ok) {
      return null;
    }

    const raw = await res.text();
    // Look for eval(function(h,u,n,t,e,r){...}(args))
    const match = raw.match(
      /\}\s*\(\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/
    );

    if (!match) {
      return null;
    }

    const [, h, u, n, t, e, r] = match;
    const decoded = decodeSnapApp(
      h,
      parseInt(u, 10),
      n,
      parseInt(t, 10),
      parseInt(e, 10),
      parseInt(r, 10)
    );

    return parseSnapSaveHtml(decoded, url);
  } catch (err) {
    console.error("SnapSave Facebook extraction error:", err);
    return null;
  } finally {
    clearTimeout(timeoutId);
  }
}

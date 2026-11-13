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
    "0",
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

function decodeJwtPayload(token: string): Record<string, any> | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) base64 += "=";
    const decodedStr =
      typeof atob === "function" ? atob(base64) : Buffer.from(base64, "base64").toString("utf-8");
    return JSON.parse(decodedStr);
  } catch {
    return null;
  }
}

function parseSnapSaveHtml(rawHtml: string, originalUrl: string): ExtractedMedia | null {
  const html = rawHtml.replace(/\\"/g, '"').replace(/\\'/g, "'").replace(/\\\//g, "/");

  const thumbMatch = html.match(/<img[^>]+src="([^"]+)"/i);
  let thumbnail = thumbMatch ? thumbMatch[1].replace(/&amp;/g, "&") : undefined;
  if (thumbnail && thumbnail.includes("token=")) {
    const token = thumbnail.split("token=")[1]?.split("&")[0];
    const payload = token ? decodeJwtPayload(token) : null;
    if (payload?.url) thumbnail = payload.url;
  }

  const titleMatch =
    html.match(/<strong>(.*?)<\/strong>/i) || html.match(/<span class="video-des">(.*?)<\/span>/i);
  let title = titleMatch ? titleMatch[1].trim() : "Facebook Video";
  if (title === "..." || !title) title = "Facebook Video";

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

      let directUrl = rawDownloadUrl;
      if (rawDownloadUrl.includes("token=")) {
        const token = rawDownloadUrl.split("token=")[1]?.split("&")[0];
        const payload = token ? decodeJwtPayload(token) : null;
        if (payload?.url) directUrl = payload.url;
      }

      options.push({
        quality,
        format: "mp4",
        url: directUrl || rawDownloadUrl,
      });
    }
  }

  if (options.length === 0) {
    const linkRegex = /href="(https:\/\/[^"]*(?:rapidcdn\.app|fbcdn\.net)[^"]*)"/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRegex.exec(html)) !== null) {
      const u = m[1].replace(/&amp;/g, "&");
      if (!options.some((o) => o.url === u)) {
        options.push({ quality: "HD", format: "mp4", url: u });
      }
    }
  }

  if (options.length === 0) return null;

  return {
    platform: "facebook",
    originalUrl,
    title,
    thumbnail,
    downloadUrl: options[0].url,
    options,
  };
}

export async function extractFacebook(url: string): Promise<ExtractedMedia | null> {
  // Tier 1: Direct Facebook OpenGraph & Native Stream Parser
  try {
    const fbRes = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (fbRes.ok) {
      const html = await fbRes.text();
      const sdMatch =
        html.match(/"browser_native_sd_url":"(.*?)"/) ||
        html.match(/"playable_url":"(.*?)"/) ||
        html.match(/sd_src\s*:\s*"([^"]*)"/);
      const hdMatch =
        html.match(/"browser_native_hd_url":"(.*?)"/) ||
        html.match(/"playable_url_quality_hd":"(.*?)"/) ||
        html.match(/hd_src\s*:\s*"([^"]*)"/);
      const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i);

      const rawUrl = hdMatch?.[1] || sdMatch?.[1];
      if (rawUrl) {
        const cleanUrl = JSON.parse(`{"u":"${rawUrl}"}`).u;
        return {
          platform: "facebook",
          originalUrl: url,
          title: titleMatch ? titleMatch[1] : "Facebook Video",
          downloadUrl: cleanUrl,
          options: [{ quality: "HD Clean", format: "mp4", url: cleanUrl }],
        };
      }
    }
  } catch {
    // Continue
  }

  // Tier 2: SnapSave Engine
  try {
    const res = await fetch("https://snapsave.app/action.php?lang=en", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        Referer: "https://snapsave.app/",
      },
      body: new URLSearchParams({ url }),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const raw = await res.text();
      const match = raw.match(
        /\}\s*\(\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*"([^"]+)"\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/
      );
      if (match) {
        const [, h, u, n, t, e, r] = match;
        const decoded = decodeSnapApp(
          h,
          parseInt(u, 10),
          n,
          parseInt(t, 10),
          parseInt(e, 10),
          parseInt(r, 10)
        );
        const parsed = parseSnapSaveHtml(decoded, url);
        if (parsed) return parsed;
      }
    }
  } catch {
    //
  }

  return null;
}

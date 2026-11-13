import { ExtractedMedia, MediaDownloadOption } from "../types";

export function extractInstagramShortcode(url: string): string | null {
  const match = url.match(/(?:instagram\.com|instagr\.am)\/(?:p|reel|tv)\/([a-zA-Z0-9_-]+)/i);
  return match ? match[1] : null;
}

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
 * Extracts Instagram video using serverless edge decoders
 */
export async function extractInstagram(url: string): Promise<ExtractedMedia | null> {
  const shortcode = extractInstagramShortcode(url);

  // 1. First Tier: SnapSave edge decoder
  try {
    const res = await fetch("https://snapsave.app/action.php?lang=en", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Referer: "https://snapsave.app/instagram-downloader",
      },
      body: new URLSearchParams({ url }),
      signal: AbortSignal.timeout(10000),
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

        // Find direct download links
        const cleanHtml = decoded
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .replace(/\\\//g, "/");

        const options: MediaDownloadOption[] = [];
        const linkRegex = /href="([^"]+)"/gi;
        let m: RegExpExecArray | null;
        while ((m = linkRegex.exec(cleanHtml)) !== null) {
          const rawLink = m[1].replace(/&amp;/g, "&");
          if (
            rawLink.includes("token=") ||
            rawLink.includes("cdninstagram") ||
            rawLink.includes("rapidcdn") ||
            rawLink.includes(".mp4")
          ) {
            let directUrl = rawLink;
            if (rawLink.includes("token=")) {
              const token = rawLink.split("token=")[1]?.split("&")[0];
              const payload = token ? decodeJwtPayload(token) : null;
              if (payload?.url) {
                directUrl = payload.url;
              }
            }

            if (!options.some((o) => o.url === directUrl)) {
              options.push({
                quality: "HD",
                format: "mp4",
                url: directUrl,
              });
            }
          }
        }

        if (options.length > 0) {
          return {
            platform: "instagram",
            originalUrl: url,
            title: "Instagram Reel",
            downloadUrl: options[0].url,
            options,
          };
        }
      }
    }
  } catch {
    // Continue to next fallback
  }

  // 2. Second Tier: SnapVideo / SaveInsta API
  try {
    const homeRes = await fetch("https://snapvideo.app/en", {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (homeRes.ok) {
      const homeHtml = await homeRes.text();
      const exp = homeHtml.match(/k_exp="([^"]+)"/)?.[1];
      const token = homeHtml.match(/k_token="([^"]+)"/)?.[1];

      if (exp && token) {
        const searchRes = await fetch("https://snapvideo.app/api/ajaxSearch", {
          method: "POST",
          headers: {
            Accept: "application/json, text/javascript, */*; q=0.01",
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
            Origin: "https://snapvideo.app",
            Referer: "https://snapvideo.app/en",
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/126 Safari/537.36",
            "X-Requested-With": "XMLHttpRequest",
          },
          body: new URLSearchParams({
            k_exp: exp,
            k_token: token,
            q: url,
            t: "media",
            lang: "en",
            v: "v2",
          }),
          signal: AbortSignal.timeout(8000),
        });

        if (searchRes.ok) {
          const data = await searchRes.json();
          if (data && data.status === "ok" && data.data) {
            const linkMatch = data.data.match(/href="([^"]+)"/i);
            if (linkMatch) {
              const downloadLink = linkMatch[1].replace(/&amp;/g, "&");
              return {
                platform: "instagram",
                originalUrl: url,
                title: "Instagram Video",
                downloadUrl: downloadLink,
                options: [
                  {
                    quality: "HD",
                    format: "mp4",
                    url: downloadLink,
                  },
                ],
              };
            }
          }
        }
      }
    }
  } catch {
    // Continue to next fallback
  }

  // 3. Third Tier: Instagram Embed & OpenGraph Scraper
  if (shortcode) {
    const embedCandidates = [
      `https://www.instagram.com/p/${shortcode}/embed/captioned/`,
      `https://www.instagram.com/reel/${shortcode}/`,
      url,
    ];

    for (const target of embedCandidates) {
      try {
        const embedRes = await fetch(target, {
          headers: {
            "User-Agent":
              "facebookexternalhit/1.1 (+http://www.facebook.com/externalhit_uatext.php)",
            Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.9",
          },
          signal: AbortSignal.timeout(6000),
        });

        if (embedRes.ok) {
          const html = await embedRes.text();
          const ogVideo =
            html.match(/<meta[^>]+property="og:video"[^>]+content="([^"]+)"/i)?.[1] ||
            html.match(/<meta[^>]+content="([^"]+)"[^>]+property="og:video"/i)?.[1] ||
            html.match(/<meta[^>]+property="og:video:secure_url"[^>]+content="([^"]+)"/i)?.[1] ||
            html.match(/"video_url":"([^"]+)"/i)?.[1] ||
            html.match(/<video[^>]+src="([^"]+)"/i)?.[1];

          if (ogVideo) {
            const directUrl = ogVideo.replace(/&amp;/g, "&").replace(/\\u0026/g, "&").replace(/\\\//g, "/");
            return {
              platform: "instagram",
              originalUrl: url,
              title: "Instagram Video",
              downloadUrl: directUrl,
              options: [
                {
                  quality: "HD",
                  format: "mp4",
                  url: directUrl,
                },
              ],
            };
          }
        }
      } catch {
        // Continue to next candidate
      }
    }
  }

  return null;
}


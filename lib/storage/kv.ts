import { SponsorAdSettings, BotStats, SupportedPlatform, RecentDownloadItem } from "../types";

export function buildViralShareUrl(targetUrl: string, customText?: string): string {
  const text =
    customText ||
    "Join our group to download Facebook, TikTok & Instagram videos without watermark for free!";
  return `https://t.me/share/url?url=${encodeURIComponent(targetUrl)}&text=${encodeURIComponent(text)}`;
}

let memoryAdSettings: SponsorAdSettings = {
  enabled: true,
  title: "❤️ Love LinkDrop? Share with Friends!",
  body: "Help your friends download Facebook, TikTok & Instagram videos without watermark for free!",
  buttonText: "📲 Share Group with Friends",
  groupInviteUrl: "",
  shareTarget: "group",
  clickUrl: "",
  slowModeSeconds: 60,
};

let memoryStats: BotStats = {
  totalDownloads: 0,
  tiktokCount: 0,
  instagramCount: 0,
  youtubeCount: 0,
  facebookCount: 0,
  otherCount: 0,
  lastUpdated: new Date().toISOString(),
  recentDownloads: [],
};

async function getKV(): Promise<any> {
  try {
    const { getCloudflareContext } = await import("@opennextjs/cloudflare");
    const ctx = await getCloudflareContext({ async: true });
    if (ctx && ctx.env && (ctx.env as any).LINKDROP_KV) {
      return (ctx.env as any).LINKDROP_KV;
    }
  } catch {
    // Non-Cloudflare / Local development fallback
  }

  if (typeof (globalThis as any).LINKDROP_KV !== "undefined") {
    return (globalThis as any).LINKDROP_KV;
  }
  return null;
}

export async function getSponsorSettings(): Promise<SponsorAdSettings> {
  try {
    const kv = await getKV();
    if (kv) {
      const raw = await kv.get("settings");
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryAdSettings = { ...memoryAdSettings, ...parsed };
      }
    }
  } catch {
    // Fallback to memory
  }

  // If clickUrl is not explicitly set, dynamically derive it from group link
  if (!memoryAdSettings.clickUrl && memoryAdSettings.groupInviteUrl) {
    memoryAdSettings.clickUrl = buildViralShareUrl(memoryAdSettings.groupInviteUrl);
  }

  return memoryAdSettings;
}

export async function updateSponsorSettings(
  settings: Partial<SponsorAdSettings>
): Promise<SponsorAdSettings> {
  memoryAdSettings = { ...memoryAdSettings, ...settings };

  // If user changed group link and didn't set custom clickUrl, update the viral share URL
  if (memoryAdSettings.groupInviteUrl && (!settings.clickUrl || settings.shareTarget === "group")) {
    memoryAdSettings.clickUrl = buildViralShareUrl(memoryAdSettings.groupInviteUrl);
  }

  try {
    const kv = await getKV();
    if (kv) {
      await kv.put("settings", JSON.stringify(memoryAdSettings));
    }
  } catch {
    // Ignore in dev
  }

  return memoryAdSettings;
}

export async function getBotStats(): Promise<BotStats> {
  try {
    const kv = await getKV();
    if (kv) {
      const raw = await kv.get("stats");
      if (raw) {
        const parsed = JSON.parse(raw);
        memoryStats = { ...memoryStats, ...parsed };
      }
    }
  } catch {
    // Fallback to memory
  }
  return memoryStats;
}

export async function incrementDownloadStats(
  platform: SupportedPlatform,
  title?: string
): Promise<void> {
  let stats = memoryStats;
  const kv = await getKV();

  try {
    if (kv) {
      const raw = await kv.get("stats");
      if (raw) stats = JSON.parse(raw);
    }
  } catch {
    // Fallback
  }

  stats.totalDownloads += 1;
  if (platform === "tiktok") stats.tiktokCount += 1;
  else if (platform === "instagram") stats.instagramCount += 1;
  else if (platform === "youtube") stats.youtubeCount += 1;
  else if (platform === "facebook") stats.facebookCount = (stats.facebookCount || 0) + 1;
  else stats.otherCount += 1;

  stats.lastUpdated = new Date().toISOString();

  // Keep last 25 real recent downloads
  const recent: RecentDownloadItem[] = stats.recentDownloads || [];
  recent.unshift({
    id: Math.random().toString(36).substring(2, 9),
    platform,
    title: title ? title.substring(0, 80) : undefined,
    timestamp: new Date().toISOString(),
  });
  stats.recentDownloads = recent.slice(0, 25);

  memoryStats = stats;

  try {
    if (kv) {
      await kv.put("stats", JSON.stringify(stats));
    }
  } catch {
    // Ignore in dev
  }
}

export async function resetBotStats(): Promise<BotStats> {
  const wiped: BotStats = {
    totalDownloads: 0,
    tiktokCount: 0,
    instagramCount: 0,
    youtubeCount: 0,
    facebookCount: 0,
    otherCount: 0,
    lastUpdated: new Date().toISOString(),
    recentDownloads: [],
  };

  memoryStats = wiped;

  try {
    const kv = await getKV();
    if (kv) {
      await kv.put("stats", JSON.stringify(wiped));
    }
  } catch {
    // Ignore in dev
  }

  return wiped;
}

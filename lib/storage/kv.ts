import { SponsorAdSettings, BotStats, SupportedPlatform } from "../types";

let memoryAdSettings: SponsorAdSettings = {
  enabled: true,
  title: "❤️ Love LinkDrop? Share with Friends!",
  body: "Help your friends download Facebook, TikTok & Instagram videos without watermark for free!",
  buttonText: "📲 Share with Friends",
  clickUrl: "https://t.me/share/url?url=https%3A%2F%2Ft.me%2Fmylinkdropbot&text=Download%20Facebook%2C%20TikTok%2C%20and%20Instagram%20videos%20without%20watermark%20for%20free%20with%20%40mylinkdropbot%21",
  slowModeSeconds: 60,
};

let memoryStats: BotStats = {
  totalDownloads: 1420,
  tiktokCount: 840,
  instagramCount: 390,
  youtubeCount: 160,
  otherCount: 30,
  lastUpdated: new Date().toISOString(),
};

export async function getSponsorSettings(): Promise<SponsorAdSettings> {
  return memoryAdSettings;
}

export async function updateSponsorSettings(settings: Partial<SponsorAdSettings>): Promise<SponsorAdSettings> {
  memoryAdSettings = { ...memoryAdSettings, ...settings };
  return memoryAdSettings;
}

export async function getBotStats(): Promise<BotStats> {
  return memoryStats;
}

export async function incrementDownloadStats(platform: SupportedPlatform): Promise<void> {
  memoryStats.totalDownloads += 1;
  if (platform === "tiktok") memoryStats.tiktokCount += 1;
  else if (platform === "instagram") memoryStats.instagramCount += 1;
  else if (platform === "youtube") memoryStats.youtubeCount += 1;
  else memoryStats.otherCount += 1;
  memoryStats.lastUpdated = new Date().toISOString();
}


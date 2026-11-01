import { SponsorAdSettings, BotStats, SupportedPlatform } from "../types";

let memoryAdSettings: SponsorAdSettings = {
  enabled: true,
  title: "🚀 Trade Crypto with Zero Fees",
  body: "Join our official partner platform today and get up to $1,000 welcome bonus!",
  buttonText: "👉 Claim $1,000 Bonus Now",
  clickUrl: "https://t.me",
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


export type SupportedPlatform =
  | "tiktok"
  | "instagram"
  | "youtube"
  | "snapchat"
  | "facebook"
  | "twitter"
  | "reddit"
  | "unknown";

export interface MediaDownloadOption {
  quality: string;
  format: "mp4" | "mp3";
  url: string;
  isAudioOnly?: boolean;
}

export interface ExtractedMedia {
  platform: SupportedPlatform;
  originalUrl: string;
  title: string;
  author?: string;
  thumbnail?: string;
  duration?: number;
  downloadUrl: string;
  audioUrl?: string;
  options: MediaDownloadOption[];
}

export interface SponsorAdSettings {
  enabled: boolean;
  title: string;
  body: string;
  buttonText: string;
  clickUrl: string;
  slowModeSeconds: number;
}

export interface BotStats {
  totalDownloads: number;
  tiktokCount: number;
  instagramCount: number;
  youtubeCount: number;
  otherCount: number;
  lastUpdated: string;
}


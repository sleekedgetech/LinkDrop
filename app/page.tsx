"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Clipboard,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Send,
  Sparkles,
  ShieldCheck,
  Zap,
  ArrowRight,
  ExternalLink,
  SlidersHorizontal,
  FileVideo,
  Music,
  Share2,
} from "lucide-react";
import { SupportedPlatform, ExtractedMedia } from "@/lib/types";
import { detectPlatform } from "@/lib/extractor/platform";

const PLATFORM_CONFIG: Record<
  SupportedPlatform,
  { name: string; color: string; bg: string; border: string; badge: string }
> = {
  tiktok: {
    name: "TikTok",
    color: "text-cyan-400",
    bg: "bg-cyan-500/10",
    border: "border-cyan-500/30",
    badge: "border-cyan-500/40 text-cyan-300 bg-cyan-950/40",
  },
  instagram: {
    name: "Instagram",
    color: "text-pink-400",
    bg: "bg-pink-500/10",
    border: "border-pink-500/30",
    badge: "border-pink-500/40 text-pink-300 bg-pink-950/40",
  },
  youtube: {
    name: "YouTube",
    color: "text-red-400",
    bg: "bg-red-500/10",
    border: "border-red-500/30",
    badge: "border-red-500/40 text-red-300 bg-red-950/40",
  },
  snapchat: {
    name: "Snapchat",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/30",
    badge: "border-amber-500/40 text-amber-300 bg-amber-950/40",
  },
  facebook: {
    name: "Facebook",
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    badge: "border-blue-500/40 text-blue-300 bg-blue-950/40",
  },
  twitter: {
    name: "X (Twitter)",
    color: "text-slate-200",
    bg: "bg-slate-500/10",
    border: "border-slate-500/30",
    badge: "border-slate-400/40 text-slate-200 bg-slate-900/40",
  },
  reddit: {
    name: "Reddit",
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    badge: "border-orange-500/40 text-orange-300 bg-orange-950/40",
  },
  unknown: {
    name: "Auto Detect",
    color: "text-gray-400",
    bg: "bg-gray-500/10",
    border: "border-gray-500/30",
    badge: "border-gray-500/40 text-gray-300 bg-gray-900/40",
  },
};

export default function Home() {
  const [url, setUrl] = useState("");
  const [detectedPlatform, setDetectedPlatform] = useState<SupportedPlatform>("unknown");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ExtractedMedia | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (url.trim()) {
      setDetectedPlatform(detectPlatform(url.trim()));
    } else {
      setDetectedPlatform("unknown");
    }
  }, [url]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text.trim());
      }
    } catch {
      // Fallback
    }
  };

  const handleDownload = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    let cleanUrl = url.trim();
    if (!cleanUrl) return;

    if (!cleanUrl.startsWith("http://") && !cleanUrl.startsWith("https://")) {
      cleanUrl = "https://" + cleanUrl;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: cleanUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to extract clean video");
      }

      setResult(data);
      setTimeout(() => {
        document.getElementById("result-card")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please check your link.");
    } finally {
      setLoading(false);
    }
  };

  const currentPlatformInfo = PLATFORM_CONFIG[detectedPlatform];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Top Navigation */}
      <header className="border-b border-white/10 bg-obsidian-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a href="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-brand-cyan/40 shadow-lg shadow-brand-cyan/20 group-hover:scale-105 transition shrink-0 bg-black">
                <img src="/logo.jpg" alt="LinkDrop Bot" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-baseline">
                  <span className="font-black text-xl tracking-tight text-white">Link</span>
                  <span className="font-black text-xl tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-electric to-brand-cyan">Drop</span>
                </div>
                <div className="text-[9px] tracking-[0.28em] font-extrabold text-brand-cyan uppercase -mt-1 opacity-90">
                  B O T
                </div>
              </div>
            </a>
            <span className="ml-1 text-[10px] tracking-wider uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hidden sm:inline-flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> Community Bot Live
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="#community"
              className="text-sm font-medium text-gray-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Send className="w-4 h-4 text-brand-cyan" />
              Telegram Group
            </a>
            <a
              href="/admin"
              className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-white/10 bg-obsidian-850 hover:bg-obsidian-800 text-gray-300 hover:text-white transition flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-gray-400" />
              Admin
            </a>
          </div>
        </div>
      </header>

      {/* Hero & Downloader Section */}
      <main className="flex-1 max-w-4xl mx-auto w-full px-4 pt-10 pb-20">
        <div className="text-center space-y-4 mb-10">
          <div className="flex justify-center mb-1">
            <div className="relative group cursor-pointer">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl overflow-hidden border-2 border-brand-cyan/40 shadow-2xl shadow-brand-cyan/25 bg-black transition transform group-hover:scale-105">
                <img src="/logo.jpg" alt="LinkDrop Mascot" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-2 -right-2 px-2 py-0.5 rounded-full bg-brand-electric text-[10px] font-black text-white uppercase tracking-wider border border-white/20 shadow-md">
                v1.0
              </div>
            </div>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-brand-cyan/30 bg-brand-cyan/10 text-xs font-semibold text-brand-cyan">
            <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
            <span>Zero Watermarks • Original HD Bitrate • 100% Free</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Drop the link. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-brand-cyan to-brand-electric">
              Download clean media.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-gray-400 max-w-xl mx-auto">
            Extract pristine MP4 videos and MP3 audio from TikTok, Instagram, YouTube, Snapchat, and Facebook without watermarks or logos.
          </p>
        </div>

        {/* Input Card */}
        <div className="bg-obsidian-900/90 border border-brand-cyan/20 rounded-2xl p-3 sm:p-4 shadow-2xl shadow-black/80 backdrop-blur-xl relative">
          <form
            action="javascript:void(0);"
            method="POST"
            onSubmit={handleDownload}
            className="flex flex-col sm:flex-row items-stretch gap-2.5"
          >
            <div className="relative flex-1 flex items-center">
              <input
                type="text"
                inputMode="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleDownload(e);
                  }
                }}
                placeholder="Paste video URL (TikTok, Instagram Reels, YouTube, etc.)..."
                className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-4 py-3.5 pl-11 text-sm sm:text-base text-white placeholder-gray-500 focus:outline-none focus:border-brand-cyan/80 transition"
                required
              />
              <div className="absolute left-3.5 text-gray-500">
                <Download className="w-4 h-4" />
              </div>
              <button
                type="button"
                onClick={handlePaste}
                title="Paste from clipboard"
                className="absolute right-3 px-2.5 py-1 text-xs font-semibold rounded-lg bg-obsidian-800 text-gray-300 hover:text-white hover:bg-obsidian-700 transition flex items-center gap-1 border border-white/5"
              >
                <Clipboard className="w-3.5 h-3.5" />
                Paste
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-brand-electric to-brand-cyan hover:opacity-95 text-black font-extrabold px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-brand-cyan/20 disabled:opacity-50 text-sm sm:text-base cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <span>Download Clean</span>
                  <ArrowRight className="w-4 h-4 text-black" />
                </>
              )}
            </button>
          </form>

          {/* Platform Status Indicator */}
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span>Detected Engine:</span>
              <span
                className={`font-semibold px-2 py-0.5 rounded-md border text-[11px] ${currentPlatformInfo.badge}`}
              >
                {currentPlatformInfo.name}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> No Ads in Output
              </span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Zap className="w-3.5 h-3.5" /> 1080p Full HD
              </span>
            </div>
          </div>
        </div>

        {/* Loading Progress State */}
        {loading && (
          <div className="mt-6 p-4 rounded-xl border border-brand-cyan/30 bg-obsidian-900/90 shadow-xl shadow-brand-cyan/10 animate-in fade-in duration-200">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-brand-cyan/10 border border-brand-cyan/30 flex items-center justify-center shrink-0">
                <Loader2 className="w-5 h-5 text-brand-cyan animate-spin" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-brand-cyan" />
                    Working on your video...
                  </p>
                  <span className="text-[11px] font-mono text-brand-cyan animate-pulse">
                    Processing stream
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">
                  Bypassing platform restrictions & generating clean HD download options...
                </p>
              </div>
            </div>
            {/* Animated Progress Bar */}
            <div className="mt-3 w-full bg-obsidian-950 rounded-full h-1.5 overflow-hidden">
              <div className="bg-gradient-to-r from-brand-electric via-brand-cyan to-brand-electric w-full h-full rounded-full animate-pulse" />
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-6 p-4 rounded-xl border border-red-500/30 bg-red-950/20 text-red-300 text-sm flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Extraction Failed</p>
              <p className="text-red-400/90 text-xs mt-0.5">{error}</p>
            </div>
          </div>
        )}

        {/* Result Card */}
        {result && (
          <div id="result-card" className="mt-8 bg-obsidian-900 border border-brand-cyan/30 rounded-2xl p-5 shadow-2xl shadow-brand-cyan/10 animate-in fade-in duration-300">
            <div className="flex flex-col md:flex-row gap-5 items-start">
              {result.thumbnail && (
                <div className="w-full md:w-56 aspect-video rounded-xl overflow-hidden bg-obsidian-950 relative border border-white/10 shrink-0">
                  <img
                    src={result.thumbnail}
                    alt={result.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/70 backdrop-blur-sm text-[10px] font-bold text-white uppercase border border-white/10">
                    {result.platform}
                  </div>
                </div>
              )}

              <div className="flex-1 space-y-3 w-full">
                <div>
                  <h3 className="font-bold text-lg text-white line-clamp-2">
                    {result.title}
                  </h3>
                  {result.author && (
                    <p className="text-xs text-gray-400 mt-1">
                      Creator: <span className="text-cyan-400 font-medium">@{result.author}</span>
                    </p>
                  )}
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-semibold tracking-wider text-gray-400 uppercase">
                    Available Clean Formats:
                  </p>
                  <div className="flex flex-wrap gap-2.5">
                    {result.options.map((opt, idx) => (
                      <a
                        key={idx}
                        href={`/api/stream?url=${encodeURIComponent(opt.url)}&filename=linkdrop-${result.platform}-${Date.now()}.${opt.format}`}
                        className="px-4 py-2.5 rounded-xl font-bold text-xs bg-obsidian-800 hover:bg-obsidian-700 text-white border border-white/10 hover:border-cyan-500/50 transition flex items-center gap-2 group"
                      >
                        {opt.isAudioOnly ? (
                          <Music className="w-4 h-4 text-brand-pink group-hover:scale-110 transition" />
                        ) : (
                          <FileVideo className="w-4 h-4 text-brand-cyan group-hover:scale-110 transition" />
                        )}
                        <span>{opt.quality}</span>
                        <Download className="w-3.5 h-3.5 text-gray-400 ml-1" />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Telegram Community Feature Section */}
        <section
          id="community"
          className="mt-20 border border-brand-cyan/25 bg-gradient-to-b from-obsidian-900 to-obsidian-950 rounded-3xl p-6 sm:p-10 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-80 h-80 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

          <div className="max-w-2xl relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-cyan/10 border border-brand-cyan/30 text-xs font-semibold text-brand-cyan mb-4">
              <Send className="w-3.5 h-3.5" />
              Official Telegram Community Bot
            </div>

            <div className="flex items-center gap-3.5 mb-5">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-brand-cyan/40 shadow-xl shadow-brand-cyan/20 bg-black shrink-0">
                <img src="/logo.jpg" alt="LinkDrop Bot" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-baseline gap-1.5">
                  <span className="font-extrabold text-white text-xl">LinkDrop</span>
                  <span className="text-xs font-black tracking-widest uppercase text-brand-cyan">BOT</span>
                </div>
                <p className="text-xs text-gray-400">Pristine no-watermark downloads in Telegram groups</p>
              </div>
            </div>

            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Skip the browser. <br />
              Download directly in our Telegram Community.
            </h2>

            <p className="mt-3 text-sm sm:text-base text-gray-400 leading-relaxed">
              Drop any link in our Telegram group and the bot automatically replies with the playable, watermark-free video right in the chat.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-obsidian-850/60 border border-white/5">
                <div className="text-brand-cyan font-bold text-sm mb-1">⏳ Native 60s Slow Mode</div>
                <div className="text-xs text-gray-400">
                  Fair-share spam protection with countdown timers displayed right in your Telegram message box.
                </div>
              </div>

              <div className="p-4 rounded-xl bg-obsidian-850/60 border border-white/5">
                <div className="text-brand-pink font-bold text-sm mb-1">🎬 Zero In-Video Ads</div>
                <div className="text-xs text-gray-400">
                  Clean original stream delivery without obnoxious watermarks, overlays, or modified outro audio.
                </div>
              </div>
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <a
                href="https://t.me"
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-xl font-extrabold text-sm bg-gradient-to-r from-brand-electric to-brand-cyan hover:opacity-95 text-black transition flex items-center gap-2 shadow-lg shadow-brand-cyan/25"
              >
                <Send className="w-4 h-4" />
                Join Telegram Community
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
              <span className="text-xs text-gray-400">Free to join • Instant access</span>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-obsidian-950 py-8 text-center text-xs text-gray-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} LinkDrop. Fast, clean multi-platform media downloader.</p>
          <div className="flex gap-4">
            <a href="/admin" className="hover:text-gray-300 transition">
              Admin Dashboard
            </a>
            <a href="https://t.me" className="hover:text-gray-300 transition">
              Telegram Bot
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}


"use client";

import React, { useState, useEffect } from "react";
import {
  SlidersHorizontal,
  Save,
  CheckCircle2,
  TrendingUp,
  Clock,
  Sparkles,
  Link as LinkIcon,
  Send,
  Eye,
  RefreshCw,
  Copy,
  ChevronLeft,
} from "lucide-react";
import { SponsorAdSettings, BotStats } from "@/lib/types";

export default function AdminPage() {
  const [settings, setSettings] = useState<SponsorAdSettings>({
    enabled: true,
    title: "🚀 Trade Crypto with Zero Fees",
    body: "Join our official partner platform today and get up to $1,000 welcome bonus!",
    buttonText: "👉 Claim $1,000 Bonus Now",
    clickUrl: "https://t.me",
    slowModeSeconds: 60,
  });

  const [stats, setStats] = useState<BotStats>({
    totalDownloads: 1420,
    tiktokCount: 840,
    instagramCount: 390,
    youtubeCount: 160,
    otherCount: 30,
    lastUpdated: new Date().toISOString(),
  });

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.stats) setStats(data.stats);
      })
      .catch(() => {});
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      //
    } finally {
      setSaving(false);
    }
  };

  const copyWebhook = () => {
    const url = `${window.location.origin}/api/telegram/webhook`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  return (
    <div className="min-h-screen bg-obsidian-950 text-gray-100 flex flex-col font-sans">
      {/* Header */}
      <header className="border-b border-white/10 bg-obsidian-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <a
              href="/"
              className="p-2 rounded-lg bg-obsidian-800 hover:bg-obsidian-700 text-gray-400 hover:text-white transition"
              title="Back to Downloader"
            >
              <ChevronLeft className="w-5 h-5" />
            </a>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight text-white">
                Link<span className="text-cyan-400">Drop</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-semibold">
                Admin Control
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-4 py-2 rounded-xl text-xs sm:text-sm flex items-center gap-1.5 transition shadow-lg shadow-cyan-500/20 disabled:opacity-50"
            >
              {saveSuccess ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-black" />
                  <span>Saved!</span>
                </>
              ) : saving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 text-black" />
                  <span>Publish Changes</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Analytics Grid */}
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
              <span>Total Delivered</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
              {stats.totalDownloads.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-emerald-400 flex items-center gap-1">
              <span>+18.4% this week</span>
            </div>
          </div>

          <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
              <span>TikTok (Clean)</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-cyan-400">
              {stats.tiktokCount.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-gray-500">
              {Math.round((stats.tiktokCount / stats.totalDownloads) * 100)}% of traffic
            </div>
          </div>

          <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
              <span>Instagram Reels</span>
              <span className="w-2 h-2 rounded-full bg-pink-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-pink-400">
              {stats.instagramCount.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-gray-500">
              {Math.round((stats.instagramCount / stats.totalDownloads) * 100)}% of traffic
            </div>
          </div>

          <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-4">
            <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
              <span>YouTube Media</span>
              <span className="w-2 h-2 rounded-full bg-red-400" />
            </div>
            <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-red-400">
              {stats.youtubeCount.toLocaleString()}
            </div>
            <div className="mt-1 text-[11px] text-gray-500">
              {Math.round((stats.youtubeCount / stats.totalDownloads) * 100)}% of traffic
            </div>
          </div>
        </section>

        {/* Ad Manager & Live Preview Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Ad Editor */}
          <div className="lg:col-span-7 bg-obsidian-900 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  Sponsor Ad Engine
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  This copy is dynamically stamped on video captions delivered in your Telegram Community.
                </p>
              </div>

              {/* Active Toggle */}
              <label className="flex items-center cursor-pointer gap-2">
                <span className="text-xs font-semibold text-gray-300">
                  {settings.enabled ? "Active" : "Paused"}
                </span>
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={(e) => setSettings({ ...settings, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-obsidian-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-cyan-500"></div>
              </label>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Sponsor Headline / Title
                </label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  placeholder="e.g. 🚀 Trade Crypto with Zero Fees"
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Ad Body / Pitch Copy
                </label>
                <textarea
                  value={settings.body}
                  onChange={(e) => setSettings({ ...settings, body: e.target.value })}
                  rows={3}
                  placeholder="e.g. Join our official partner platform today and get up to $1,000 welcome bonus!"
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition resize-none"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    CTA Button Label
                  </label>
                  <input
                    type="text"
                    value={settings.buttonText}
                    onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                    placeholder="e.g. 👉 Claim Bonus Now"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Destination URL
                  </label>
                  <input
                    type="url"
                    value={settings.clickUrl}
                    onChange={(e) => setSettings({ ...settings, clickUrl: e.target.value })}
                    placeholder="https://t.me/partnerlink"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                    required
                  />
                </div>
              </div>

              {/* Slow Mode Configuration */}
              <div className="pt-4 border-t border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-gray-300 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    Telegram Slow Mode Delay
                  </label>
                  <span className="text-xs font-bold text-cyan-400">
                    {settings.slowModeSeconds} Seconds
                  </span>
                </div>
                <div className="flex gap-2">
                  {[30, 60, 120, 300].map((sec) => (
                    <button
                      key={sec}
                      type="button"
                      onClick={() => setSettings({ ...settings, slowModeSeconds: sec })}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold border transition ${
                        settings.slowModeSeconds === sec
                          ? "bg-cyan-500/20 border-cyan-500 text-cyan-300"
                          : "bg-obsidian-950 border-white/10 text-gray-400 hover:text-white"
                      }`}
                    >
                      {sec}s
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-gray-500 mt-2">
                  Telegram natively displays a live countdown in the user's message bar for this duration.
                </p>
              </div>
            </form>
          </div>

          {/* Live Preview Panel */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Telegram Group Preview
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">
                  Live Preview
                </span>
              </div>

              {/* Mock Telegram Message Bubble */}
              <div className="bg-[#182533] rounded-2xl p-3.5 border border-white/5 space-y-2.5 text-sm shadow-xl">
                {/* Mock Video Placeholder */}
                <div className="w-full aspect-video rounded-xl bg-[#0e1621] border border-white/5 flex items-center justify-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-12 border-l-cyan-400 ml-1" />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-gray-300">
                    0:45 • 1080p
                  </div>
                </div>

                {/* Caption */}
                <div className="text-xs text-gray-200 space-y-1.5 pt-1">
                  <p className="font-semibold text-white">✨ Downloaded via LinkDrop (No Watermark)</p>
                  <p className="text-gray-400 italic text-[11px]">🎬 Viral TikTok Reel #trending</p>

                  {settings.enabled ? (
                    <div className="my-2 p-2.5 rounded-lg bg-[#242f3d] border border-white/5 text-[11px] space-y-1">
                      <p className="font-bold text-cyan-400">{settings.title}</p>
                      <p className="text-gray-300">{settings.body}</p>
                      <p className="text-cyan-300 font-semibold underline">👉 Click Here</p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500 italic">[Sponsor ad disabled]</p>
                  )}

                  <p className="text-[10px] text-gray-400">
                    ⏳ <i>Slow mode active: {settings.slowModeSeconds}s countdown</i>
                  </p>
                </div>

                {/* Telegram Inline Button */}
                {settings.enabled && (
                  <div className="pt-1">
                    <a
                      href={settings.clickUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2 px-3 rounded-lg bg-[#2b5278] hover:bg-[#32608d] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {settings.buttonText}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Webhook Quick Setup Card */}
            <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-6 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Send className="w-4 h-4 text-cyan-400" />
                Telegram Webhook URL
              </h3>
              <p className="text-xs text-gray-400">
                Register this endpoint with Telegram BotFather using your bot token to route community messages:
              </p>

              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={
                    typeof window !== "undefined"
                      ? `${window.location.origin}/api/telegram/webhook`
                      : "https://your-domain.pages.dev/api/telegram/webhook"
                  }
                  className="bg-obsidian-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-300 font-mono flex-1 focus:outline-none"
                />
                <button
                  onClick={copyWebhook}
                  className="px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-white border border-white/10 text-xs font-semibold flex items-center gap-1 transition"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {copiedWebhook ? "Copied!" : "Copy"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}


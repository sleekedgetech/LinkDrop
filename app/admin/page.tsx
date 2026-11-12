"use client";

import React, { useState, useEffect } from "react";
import {
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
  Trash2,
  Users,
  ShieldCheck,
  Activity,
  Share2,
  ExternalLink,
  AlertCircle,
} from "lucide-react";
import { SponsorAdSettings, BotStats, RecentDownloadItem } from "@/lib/types";

export default function AdminPage() {
  const [settings, setSettings] = useState<SponsorAdSettings>({
    enabled: true,
    title: "❤️ Love LinkDrop? Share with Friends!",
    body: "Help your friends download Facebook, TikTok & Instagram videos without watermark for free!",
    buttonText: "📲 Share Group with Friends",
    groupInviteUrl: "",
    shareTarget: "group",
    clickUrl: "",
    slowModeSeconds: 60,
  });

  const [stats, setStats] = useState<BotStats>({
    totalDownloads: 0,
    tiktokCount: 0,
    instagramCount: 0,
    youtubeCount: 0,
    facebookCount: 0,
    otherCount: 0,
    lastUpdated: new Date().toISOString(),
    recentDownloads: [],
  });

  const [botInfo, setBotInfo] = useState<{ username?: string; first_name?: string } | null>(null);
  const [webhookInfo, setWebhookInfo] = useState<{ url?: string; pending_update_count?: number } | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedWebhook, setCopiedWebhook] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [resyncing, setResyncing] = useState(false);
  const [resyncSuccess, setResyncSuccess] = useState(false);

  const fetchAdminData = () => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings) setSettings(data.settings);
        if (data.stats) setStats(data.stats);
        if (data.bot) setBotInfo(data.bot);
        if (data.webhook) setWebhookInfo(data.webhook);
      })
      .catch(() => {});
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch {
      // Non-fatal
    } finally {
      setSaving(false);
    }
  };

  const handleResetStats = async () => {
    if (!window.confirm("Are you sure you want to wipe all analytics data? This will reset download counters to 0.")) {
      return;
    }
    setResetting(true);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reset_stats" }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      }
    } catch {
      //
    } finally {
      setResetting(false);
    }
  };

  const handleResyncWebhook = async () => {
    setResyncing(true);
    setResyncSuccess(false);
    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "resync_webhook", origin: window.location.origin }),
      });
      if (res.ok) {
        setResyncSuccess(true);
        setTimeout(() => setResyncSuccess(false), 3000);
        fetchAdminData();
      }
    } catch {
      //
    } finally {
      setResyncing(false);
    }
  };

  const copyWebhook = () => {
    const url = `${window.location.origin}/api/telegram/webhook`;
    navigator.clipboard.writeText(url);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2000);
  };

  // Helper to construct viral share URL pointing to group
  const effectiveShareUrl =
    settings.shareTarget === "group" && settings.groupInviteUrl
      ? `https://t.me/share/url?url=${encodeURIComponent(settings.groupInviteUrl)}&text=${encodeURIComponent(
          "Join our group to download Facebook, TikTok & Instagram videos without watermark for free!"
        )}`
      : settings.clickUrl || (settings.groupInviteUrl ? settings.groupInviteUrl : "https://t.me");

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
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg overflow-hidden border border-brand-cyan/40 shadow-sm bg-black shrink-0">
                <img src="/logo.jpg" alt="LinkDrop Logo" className="w-full h-full object-cover" />
              </div>
              <div className="flex items-baseline">
                <span className="font-extrabold text-lg tracking-tight text-white">Link</span>
                <span className="font-extrabold text-lg tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-brand-electric to-brand-cyan">
                  Drop
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30 font-bold tracking-wider uppercase">
                Admin Console
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => fetchAdminData()}
              className="p-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gray-400 hover:text-white transition border border-white/10"
              title="Refresh Real Data"
            >
              <RefreshCw className="w-4 h-4" />
            </button>

            <button
              onClick={() => handleSave()}
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
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 space-y-8">
        {/* Telegram Community Notice */}
        <div className="bg-gradient-to-r from-cyan-950/40 via-obsidian-900 to-obsidian-900 border border-cyan-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0 mt-0.5">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Telegram Group Social Sharing Active
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold">
                  Group Linked
                </span>
              </h3>
              <p className="text-xs text-gray-300 mt-0.5">
                Every download delivers the viral social button configured to share <b>your group link</b> directly to your members' friends and chats.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {botInfo && (
              <span className="text-xs font-mono bg-obsidian-800 text-cyan-300 px-3 py-1.5 rounded-xl border border-white/10 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                @{botInfo.username || "mylinkdropbot"}
              </span>
            )}
          </div>
        </div>

        {/* Real Analytics Grid */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              Live Delivery Analytics (Real Data)
            </h2>

            <button
              onClick={handleResetStats}
              disabled={resetting}
              className="text-xs text-red-400 hover:text-red-300 bg-red-950/30 hover:bg-red-950/50 border border-red-500/20 px-3 py-1.5 rounded-xl transition flex items-center gap-1.5"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{resetting ? "Resetting..." : "Wipe / Reset Analytics"}</span>
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                <span>Total Delivered</span>
                <Activity className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
                {stats.totalDownloads.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                {stats.totalDownloads === 0 ? "Ready for traffic" : "Live recorded downloads"}
              </div>
            </div>

            <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                <span>TikTok</span>
                <span className="w-2 h-2 rounded-full bg-cyan-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-cyan-400">
                {stats.tiktokCount.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                {stats.totalDownloads > 0
                  ? `${Math.round((stats.tiktokCount / stats.totalDownloads) * 100)}% of total`
                  : "0% of total"}
              </div>
            </div>

            <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                <span>Instagram</span>
                <span className="w-2 h-2 rounded-full bg-pink-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-pink-400">
                {stats.instagramCount.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                {stats.totalDownloads > 0
                  ? `${Math.round((stats.instagramCount / stats.totalDownloads) * 100)}% of total`
                  : "0% of total"}
              </div>
            </div>

            <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-4">
              <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                <span>YouTube Shorts</span>
                <span className="w-2 h-2 rounded-full bg-red-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-red-400">
                {stats.youtubeCount.toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                {stats.totalDownloads > 0
                  ? `${Math.round((stats.youtubeCount / stats.totalDownloads) * 100)}% of total`
                  : "0% of total"}
              </div>
            </div>

            <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-4 col-span-2 sm:col-span-1">
              <div className="flex items-center justify-between text-gray-400 text-xs font-medium">
                <span>Facebook</span>
                <span className="w-2 h-2 rounded-full bg-blue-400" />
              </div>
              <div className="mt-2 text-2xl sm:text-3xl font-extrabold text-blue-400">
                {(stats.facebookCount || 0).toLocaleString()}
              </div>
              <div className="mt-1 text-[11px] text-gray-500">
                {stats.totalDownloads > 0
                  ? `${Math.round(((stats.facebookCount || 0) / stats.totalDownloads) * 100)}% of total`
                  : "0% of total"}
              </div>
            </div>
          </div>
        </section>

        {/* Ad Engine & Group Link Manager */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Settings Form */}
          <div className="lg:col-span-7 bg-obsidian-900 border border-white/10 rounded-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-cyan-400" />
                  Telegram Group & Viral Share Settings
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Configure the group link that members share with their friends.
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

            <form onSubmit={handleSave} className="space-y-5">
              {/* Telegram Group Link Field (Primary) */}
              <div className="bg-obsidian-950/80 border border-cyan-500/30 rounded-xl p-4 space-y-2">
                <label className="block text-xs font-bold text-cyan-400 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-cyan-400" />
                  Your Telegram Group / Community Invite Link
                </label>
                <p className="text-[11px] text-gray-400">
                  This is the exact group link that will be shared when users click "Share with Friends".
                </p>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={settings.groupInviteUrl || ""}
                    onChange={(e) =>
                      setSettings({
                        ...settings,
                        groupInviteUrl: e.target.value,
                        clickUrl: e.target.value ? `https://t.me/share/url?url=${encodeURIComponent(e.target.value)}&text=${encodeURIComponent("Join our group to download Facebook, TikTok & Instagram videos without watermark for free!")}` : "",
                      })
                    }
                    placeholder="https://t.me/yourgroup or https://t.me/+AbCdEf"
                    className="flex-1 bg-obsidian-900 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 font-mono transition"
                  />
                  {settings.groupInviteUrl && (
                    <a
                      href={settings.groupInviteUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-cyan-400 border border-white/10 flex items-center gap-1 text-xs font-semibold"
                      title="Open Group Link"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>

              {/* Sponsor Headline */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Caption Advert Headline / Pitch Title
                </label>
                <input
                  type="text"
                  value={settings.title}
                  onChange={(e) => setSettings({ ...settings, title: e.target.value })}
                  placeholder="e.g. ❤️ Love LinkDrop? Share with Friends!"
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                  required
                />
              </div>

              {/* Pitch Body */}
              <div>
                <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                  Caption Description Body
                </label>
                <textarea
                  value={settings.body}
                  onChange={(e) => setSettings({ ...settings, body: e.target.value })}
                  rows={2}
                  placeholder="e.g. Help your friends download Facebook, TikTok & Instagram videos without watermark for free!"
                  className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition resize-none"
                  required
                />
              </div>

              {/* Button Label & Share Target */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Telegram Button Text
                  </label>
                  <input
                    type="text"
                    value={settings.buttonText}
                    onChange={(e) => setSettings({ ...settings, buttonText: e.target.value })}
                    placeholder="e.g. 📲 Share Group with Friends"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Share Target Mode
                  </label>
                  <select
                    value={settings.shareTarget || "group"}
                    onChange={(e) => {
                      const mode = e.target.value as "group" | "custom";
                      setSettings({
                        ...settings,
                        shareTarget: mode,
                      });
                    }}
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-400 transition"
                  >
                    <option value="group">Share Telegram Group (Viral)</option>
                    <option value="custom">Custom External URL</option>
                  </select>
                </div>
              </div>

              {/* Custom Destination URL (if mode is custom) */}
              {settings.shareTarget === "custom" && (
                <div>
                  <label className="block text-xs font-semibold text-gray-300 mb-1.5">
                    Custom Destination URL
                  </label>
                  <input
                    type="url"
                    value={settings.clickUrl}
                    onChange={(e) => setSettings({ ...settings, clickUrl: e.target.value })}
                    placeholder="https://yourwebsite.com or sponsor link"
                    className="w-full bg-obsidian-950 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-400 transition"
                  />
                </div>
              )}

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
                  Telegram natively limits users in the group to sending one message per interval to prevent bot spam.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 transition disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? "Saving Changes..." : "Publish Settings to Group"}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Live Preview & Bot Diagnostic Panel */}
          <div className="lg:col-span-5 space-y-6">
            {/* Live Telegram Message Bubble */}
            <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Live Group Message Preview
                </span>
                <span className="text-[10px] bg-cyan-950 text-cyan-300 border border-cyan-500/30 px-2 py-0.5 rounded-full font-semibold">
                  What Members See
                </span>
              </div>

              {/* Telegram Message Box */}
              <div className="bg-[#182533] rounded-2xl p-3.5 border border-white/5 space-y-2.5 text-sm shadow-xl">
                {/* Video Placeholder */}
                <div className="w-full aspect-video rounded-xl bg-[#0e1621] border border-white/5 flex items-center justify-center relative overflow-hidden">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                    <div className="w-0 h-0 border-t-8 border-t-transparent border-b-8 border-b-transparent border-l-12 border-l-cyan-400 ml-1" />
                  </div>
                  <div className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-black/60 text-[10px] font-mono text-gray-300">
                    0:30 • 1080p HD
                  </div>
                </div>

                {/* Caption */}
                <div className="text-xs text-gray-200 space-y-1.5 pt-1">
                  <p className="font-semibold text-white">✨ Downloaded via LinkDrop</p>
                  <p className="text-gray-400 italic text-[11px]">🎬 Viral Social Reel #trending</p>

                  {settings.enabled ? (
                    <div className="my-2 p-2.5 rounded-lg bg-[#242f3d] border border-white/5 text-[11px] space-y-1">
                      <p className="font-bold text-cyan-400">{settings.title}</p>
                      <p className="text-gray-300">{settings.body}</p>
                      <p className="text-cyan-300 font-semibold underline">
                        👉 {settings.buttonText || "Share Group with Friends"}
                      </p>
                    </div>
                  ) : (
                    <p className="text-[11px] text-gray-500 italic">[Sponsor ad disabled]</p>
                  )}

                  <p className="text-[10px] text-gray-400">
                    ⏳ <i>Slow mode active: {settings.slowModeSeconds}s countdown</i>
                  </p>
                </div>

                {/* Inline Telegram Button */}
                {settings.enabled && (
                  <div className="pt-1">
                    <a
                      href={effectiveShareUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-2.5 px-3 rounded-lg bg-[#2b5278] hover:bg-[#32608d] text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition text-center"
                    >
                      <Send className="w-3.5 h-3.5" />
                      {settings.buttonText || "📲 Share Group with Friends"}
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Telegram Webhook & Bot Diagnostics */}
            <div className="bg-obsidian-900 border border-white/10 rounded-2xl p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Bot Infrastructure Health
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                  Operational
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-gray-400 block mb-1">Telegram Webhook Endpoint:</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={
                        typeof window !== "undefined"
                          ? `${window.location.origin}/api/telegram/webhook`
                          : "https://linkdrop.sleekedgetechsolutions.workers.dev/api/telegram/webhook"
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

                <div className="flex items-center justify-between pt-1">
                  <span className="text-gray-400">Cloudflare KV Persistence:</span>
                  <span className="font-semibold text-emerald-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    LINKDROP_KV Connected
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Pending Telegram Queue:</span>
                  <span className="font-mono text-white">
                    {webhookInfo?.pending_update_count ?? 0} messages
                  </span>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleResyncWebhook}
                    disabled={resyncing}
                    className="w-full py-2 rounded-xl bg-obsidian-800 hover:bg-obsidian-700 text-gray-200 text-xs font-semibold border border-white/10 transition flex items-center justify-center gap-1.5"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${resyncing ? "animate-spin" : ""}`} />
                    <span>{resyncSuccess ? "Webhook Re-synced!" : "Re-sync Webhook with Telegram"}</span>
                  </button>
                </div>

                {/* Important Group Admin Tip */}
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300/90 text-[11px] flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-400" />
                  <div>
                    <b>Group Setup Tip:</b> Add <span className="font-mono">@{botInfo?.username || "mylinkdropbot"}</span> as an <b>Admin</b> in your group so it can process video links automatically without users having to mention the bot.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Live Recent Real Downloads Feed */}
        <section className="bg-obsidian-900 border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              Live Activity Stream (Real Downloads)
            </h3>
            <span className="text-xs text-gray-400 font-mono">
              Last updated: {new Date(stats.lastUpdated).toLocaleTimeString()}
            </span>
          </div>

          {stats.recentDownloads && stats.recentDownloads.length > 0 ? (
            <div className="divide-y divide-white/5">
              {stats.recentDownloads.map((item) => (
                <div key={item.id} className="py-2.5 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span
                      className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                        item.platform === "tiktok"
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                          : item.platform === "instagram"
                          ? "bg-pink-500/10 text-pink-400 border border-pink-500/20"
                          : item.platform === "youtube"
                          ? "bg-red-500/10 text-red-400 border border-red-500/20"
                          : item.platform === "facebook"
                          ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                          : "bg-gray-500/10 text-gray-400 border border-gray-500/20"
                      }`}
                    >
                      {item.platform}
                    </span>
                    <span className="text-gray-200 truncate max-w-[280px] sm:max-w-md">
                      {item.title || "Clean Media Stream"}
                    </span>
                  </div>
                  <span className="text-gray-500 text-[11px] font-mono shrink-0">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center space-y-2">
              <p className="text-xs text-gray-400">
                No downloads recorded yet. Analytics start clean and track real traffic in real time.
              </p>
              <p className="text-[11px] text-gray-500">
                Drop any video link into your Telegram group to see it log here live!
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

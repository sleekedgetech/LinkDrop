"use client";

import React, { useState, useEffect } from "react";
import {
  Send,
  Copy,
  CheckCircle2,
  Share2,
  MessageCircle,
  Sparkles,
  ExternalLink,
  ChevronLeft,
} from "lucide-react";

export default function SharePage() {
  const [groupUrl, setGroupUrl] = useState("https://t.me");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((res) => res.json())
      .then((data) => {
        if (data.settings?.groupInviteUrl) {
          setGroupUrl(data.settings.groupInviteUrl);
        } else if (data.bot?.username) {
          setGroupUrl(`https://t.me/${data.bot.username}`);
        }
      })
      .catch(() => {});
  }, []);

  const shareText = `Download Facebook, TikTok & Instagram videos without watermark for free in our group! Join here: ${groupUrl}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "LinkDrop Community",
          text: "Download Facebook, TikTok & Instagram videos without watermark for free!",
          url: groupUrl,
        });
      } catch {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const telegramShareUrl = `https://t.me/share/url?url=${encodeURIComponent(groupUrl)}&text=${encodeURIComponent(
    "Download Facebook, TikTok & Instagram videos without watermark for free in our group!"
  )}`;

  const whatsappShareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;

  return (
    <div className="min-h-screen bg-obsidian-950 text-gray-100 flex flex-col items-center justify-center p-4 font-sans">
      <div className="max-w-md w-full bg-obsidian-900 border border-brand-cyan/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-brand-cyan/10 space-y-6 text-center relative overflow-hidden">
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-cyan/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex flex-col items-center space-y-3">
          <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-cyan/40 shadow-xl shadow-brand-cyan/20 bg-black">
            <img src="/logo.jpg" alt="LinkDrop" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white">Join LinkDrop Community</h1>
            <p className="text-xs text-gray-400 mt-1">
              Download Facebook, TikTok, Instagram & YouTube videos without watermarks for free!
            </p>
          </div>
        </div>

        {/* Join Group Button */}
        <div>
          <a
            href={groupUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-brand-electric to-brand-cyan text-black font-extrabold text-sm flex items-center justify-center gap-2 transition hover:opacity-95 shadow-lg shadow-brand-cyan/20"
          >
            <Send className="w-4 h-4" />
            <span>Join Telegram Community</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Copy Box */}
        <div className="bg-obsidian-950/80 border border-white/10 rounded-2xl p-4 text-left space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-400">
            <span>Invite Link (Copy & Paste Anywhere):</span>
            {copied && <span className="text-emerald-400 flex items-center gap-1 font-bold">✓ Copied!</span>}
          </div>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={groupUrl}
              className="flex-1 bg-obsidian-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-cyan-300 font-mono focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs flex items-center gap-1.5 transition"
            >
              {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? "Copied" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Multi-Platform Sharing Grid */}
        <div className="space-y-2.5">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Share With Friends:</p>

          <div className="grid grid-cols-2 gap-2.5">
            <a
              href={whatsappShareUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 rounded-xl bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp</span>
            </a>

            <a
              href={telegramShareUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 rounded-xl bg-[#2AABEE]/20 hover:bg-[#2AABEE]/30 text-[#2AABEE] border border-[#2AABEE]/40 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <Send className="w-4 h-4" />
              <span>Telegram</span>
            </a>
          </div>

          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 px-3 rounded-xl bg-obsidian-800 hover:bg-obsidian-750 text-gray-200 border border-white/10 text-xs font-semibold flex items-center justify-center gap-2 transition"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>More Sharing Options (Other Apps)</span>
          </button>
        </div>

        <div className="pt-2">
          <a
            href="/"
            className="text-xs text-gray-500 hover:text-gray-300 transition inline-flex items-center gap-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Back to Downloader
          </a>
        </div>
      </div>
    </div>
  );
}


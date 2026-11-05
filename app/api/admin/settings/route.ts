import { NextResponse } from "next/server";
import { getSponsorSettings, updateSponsorSettings, getBotStats } from "@/lib/storage/kv";

export async function GET() {
  const [settings, stats] = await Promise.all([getSponsorSettings(), getBotStats()]);
  return NextResponse.json({ settings, stats });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const updated = await updateSponsorSettings(body);
    return NextResponse.json({ success: true, settings: updated });
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 400 });
  }
}


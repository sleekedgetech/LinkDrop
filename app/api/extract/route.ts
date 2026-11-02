import { NextResponse } from "next/server";
import { extractMedia } from "@/lib/extractor";
import { incrementDownloadStats } from "@/lib/storage/kv";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "Missing or invalid url" }, { status: 400 });
    }

    const result = await extractMedia(url.trim());
    await incrementDownloadStats(result.platform);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to extract clean media" },
      { status: 422 }
    );
  }
}


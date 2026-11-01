import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const targetUrl = searchParams.get("url");
  const filename = searchParams.get("filename") || "linkdrop-video.mp4";

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const mediaRes = await fetch(targetUrl);
    if (!mediaRes.ok) {
      return new NextResponse("Failed to fetch source media", { status: mediaRes.status });
    }

    const headers = new Headers();
    headers.set("Content-Type", mediaRes.headers.get("Content-Type") || "video/mp4");
    headers.set("Content-Disposition", `attachment; filename="${filename}"`);
    if (mediaRes.headers.get("Content-Length")) {
      headers.set("Content-Length", mediaRes.headers.get("Content-Length")!);
    }

    return new NextResponse(mediaRes.body, { headers });
  } catch (error) {
    return new NextResponse("Stream proxy error", { status: 500 });
  }
}


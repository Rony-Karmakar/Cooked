import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const accessToken = req.cookies.get("spotify_access_token")?.value;
  if (!accessToken) {
    return NextResponse.json({ error: "Spotify not connected" }, { status: 401 });
  }

  const res = await fetch("https://api.spotify.com/v1/me/playlists?limit=50", {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    // Token expired
    if (res.status === 401) {
      return NextResponse.json({ error: "Spotify token expired", expired: true }, { status: 401 });
    }
    return NextResponse.json({ error: text || "Spotify error" }, { status: res.status });
  }

  const data = await res.json();
  const playlists = data.items.map((pl: {
    id: string; name: string; description: string;
    tracks: { total: number }; images: { url: string }[]; owner: { display_name: string };
  }) => ({
    id: pl.id,
    name: pl.name,
    description: pl.description || "",
    trackCount: pl.tracks.total,
    imageUrl: pl.images?.[0]?.url || null,
    owner: pl.owner?.display_name || "you",
  }));

  return NextResponse.json({ playlists });
}

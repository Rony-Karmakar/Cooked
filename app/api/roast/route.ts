import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { auth } from "@clerk/nextjs/server";

interface Playlist {
  name: string;
  description: string;
  trackCount: number;
  owner: string;
}

export async function POST(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Gemini API key not configured" }, { status: 500 });
  }

  const { playlists }: { playlists: Playlist[] } = await req.json();

  if (!playlists || playlists.length === 0) {
    return NextResponse.json({ error: "No playlists provided" }, { status: 400 });
  }

  const playlistSummary = playlists
    .map(
      (p) =>
        `"${p.name}" (${p.trackCount} tracks)${p.description ? ` — described as: "${p.description}"` : ""}`
    )
    .join("\n");

  const prompt = `You are the world's most savage, brutally honest music critic AI. You have zero tolerance for bad taste and you roast people for their Spotify playlists with sharp wit, cultural references, and devastating observations.

Here are the Spotify playlists you need to roast:
${playlistSummary}

Roast this person's music taste in 3-5 paragraphs. Be:
- SAVAGE but funny (not mean-spirited, just hilariously honest)
- Specific about the playlist names and what they imply about this person's personality
- Use emojis liberally (🤮 💀 😭 🔥 👴 🗑️ etc.)
- Reference pop culture, generational vibes, or music clichés where relevant
- End with a backhanded "compliment" that's still kind of insulting

Don't hold back. Make them feel it.`;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const roast = result.response.text();

    return NextResponse.json({ roast });
  } catch (e) {
    console.error("Gemini error:", e);
    return NextResponse.json({ error: "Failed to generate roast" }, { status: 500 });
  }
}

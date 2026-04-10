import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

export async function GET(req: NextRequest) {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.redirect(new URL("/sign-in", req.url));
  }

  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const error = searchParams.get("error");
  const state = searchParams.get("state");

  // Verify state to prevent CSRF
  const cookieState = req.cookies.get("spotify_oauth_state")?.value;
  if (!state || state !== cookieState) {
    return NextResponse.redirect(new URL("/dashboard?error=state_mismatch", req.url));
  }

  if (error || !code) {
    return NextResponse.redirect(new URL("/dashboard?error=spotify_denied", req.url));
  }

  // Exchange code for tokens
  const clientId = process.env.SPOTIFY_CLIENT_ID!;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/spotify/callback`;

  const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokens = await tokenRes.json();
  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/dashboard?error=token_exchange_failed", req.url));
  }

  // Store token in a secure httpOnly cookie (expires with access token)
  const response = NextResponse.redirect(new URL("/dashboard?spotify=connected", req.url));
  response.cookies.set("spotify_access_token", tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: tokens.expires_in, // typically 3600s
    path: "/",
  });
  if (tokens.refresh_token) {
    response.cookies.set("spotify_refresh_token", tokens.refresh_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
    });
  }
  // Clear state cookie
  response.cookies.delete("spotify_oauth_state");

  return response;
}

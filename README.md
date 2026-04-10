# 🔥 Cooked — Your Music Taste, Roasted

A Next.js app that roasts your Spotify playlist using Gemini AI.

---

## Stack
- **Next.js 15** (App Router)
- **Clerk** — Auth + Spotify OAuth
- **Spotify Web API** — Fetch playlists
- **Google Gemini 1.5 Flash** — Generate the roast

---

## Setup

### 1. Clone & Install
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
GEMINI_API_KEY=your_gemini_api_key
```

### 3. Set Up Clerk

1. Go to [clerk.com](https://clerk.com) and create a new app
2. Enable **Spotify** under **Social Connections**
3. In Spotify OAuth settings, add these scopes:
   - `playlist-read-private`
   - `playlist-read-collaborative`
   - `user-read-private`
4. Add your Spotify App credentials (Client ID + Secret) in Clerk's Spotify OAuth settings
5. Create a **JWT Template** named `spotify` that includes `oauth_access_token`

### 4. Create Clerk JWT Template for Spotify Token

In Clerk Dashboard → JWT Templates → New Template:
- Name: `spotify`
- Claims:
```json
{
  "spotify_token": "{{user.external_accounts[0].token}}"
}
```
> Note: Clerk's `getToken({ template: "spotify" })` gives you the OAuth access token directly.

### 5. Get Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com)
2. Create an API key
3. Add it as `GEMINI_API_KEY` in `.env.local`

### 6. Run
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## How It Works

```
User visits / → Signs in with Spotify via Clerk
→ Dashboard fetches Clerk's Spotify OAuth token
→ /api/spotify/playlists calls Spotify Web API
→ User selects playlists
→ /api/roast sends playlist names to Gemini
→ Gemini returns devastating roast 🔥
```

---

## Project Structure

```
app/
  page.tsx              # Landing page (redirects if logged in)
  layout.tsx            # ClerkProvider wrapper
  dashboard/page.tsx    # Protected dashboard
  api/
    spotify/playlists/  # Fetches Spotify playlists
    roast/              # Sends to Gemini for roasting
components/
  LandingPage.tsx        # Hero / CTA
  DashboardClient.tsx    # Main app UI
```

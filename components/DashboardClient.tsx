"use client";
import { useState } from "react";
import { UserButton } from "@clerk/nextjs";

interface Playlist {
  id: string; name: string; description: string;
  trackCount: number; imageUrl: string | null; owner: string;
}

interface Props {
  userName: string;
  userImage?: string | null;
  spotifyConnected: boolean;
}

type Step = "idle" | "fetching" | "selecting" | "roasting" | "done" | "error";

export default function DashboardClient({ userName, spotifyConnected: initialConnected }: Props) {
  const [spotifyConnected, setSpotifyConnected] = useState(initialConnected);
  const [step, setStep] = useState<Step>("idle");
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [roast, setRoast] = useState("");
  const [error, setError] = useState("");
  const [loadingMsg, setLoadingMsg] = useState("");

  async function fetchPlaylists() {
    setStep("fetching");
    setLoadingMsg("Digging through your (questionable) library...");
    try {
      const res = await fetch("/api/spotify/playlists");
      const data = await res.json();

      // Token expired — try refresh
      if (res.status === 401 && data.expired) {
        const refreshRes = await fetch("/api/spotify/refresh", { method: "POST" });
        if (refreshRes.ok) {
          // Retry
          const retry = await fetch("/api/spotify/playlists");
          const retryData = await retry.json();
          if (!retry.ok) throw new Error(retryData.error || "Failed after refresh");
          setPlaylists(retryData.playlists);
          setStep("selecting");
          return;
        } else {
          setSpotifyConnected(false);
          throw new Error("Spotify session expired. Please reconnect.");
        }
      }

      if (!res.ok) throw new Error(data.error || "Failed to fetch playlists");
      setPlaylists(data.playlists);
      setStep("selecting");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("error");
    }
  }

  function toggleSelect(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function getRoasted() {
    const chosenPlaylists = playlists.filter((p) => selected.has(p.id));
    setStep("roasting");
    const msgs = [
      "Feeding your sins to the AI...",
      "Gemini is cackling at your taste...",
      "Preparing the devastating verdict...",
      "Almost done destroying your self-esteem...",
    ];
    let i = 0;
    setLoadingMsg(msgs[0]);
    const interval = setInterval(() => { i = (i + 1) % msgs.length; setLoadingMsg(msgs[i]); }, 1800);

    try {
      const res = await fetch("/api/roast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ playlists: chosenPlaylists }),
      });
      const data = await res.json();
      clearInterval(interval);
      if (!res.ok) throw new Error(data.error || "Roast failed");
      setRoast(data.roast);
      setStep("done");
    } catch (e: unknown) {
      clearInterval(interval);
      setError(e instanceof Error ? e.message : "Something went wrong");
      setStep("error");
    }
  }

  function reset() {
    setStep("idle");
    setPlaylists([]);
    setSelected(new Set());
    setRoast("");
    setError("");
  }

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="noise" />
      <div className="fixed inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
      <div className="fixed top-0 right-0 w-[500px] h-[500px] rounded-full opacity-5 pointer-events-none" style={{ background: "radial-gradient(circle, #FF4500 0%, transparent 70%)", filter: "blur(80px)" }} />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-5 border-b border-[--border]">
        <div className="font-display text-2xl flame-text">COOKED</div>
        <div className="flex items-center gap-4">
          {spotifyConnected && (
            <span className="flex items-center gap-1.5 text-xs text-[--green] font-mono border border-[--green] border-opacity-30 px-3 py-1 rounded-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-[--green] inline-block" />
              Spotify Connected
            </span>
          )}
          <span className="text-xs text-[--muted] font-mono hidden sm:block">hey, {userName}</span>
          <UserButton />
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-4xl mx-auto w-full px-4 py-12">

        {/* STEP: Not connected to Spotify */}
        {!spotifyConnected && step === "idle" && (
          <div className="text-center animate-slide-up">
            <div className="text-7xl mb-6 animate-float">🎵</div>
            <div className="font-display flame-text mb-4" style={{ fontSize: "56px", lineHeight: 1 }}>
              CONNECT SPOTIFY<br />TO GET COOKED
            </div>
            <p className="text-[--muted] text-sm mb-10 max-w-md mx-auto leading-relaxed">
              We need access to your Spotify playlists so Gemini can absolutely destroy your music taste. 
              Login with your Spotify account below.
            </p>
            <a
              href="/api/spotify/connect"
              className="btn-spotify px-12 py-4 text-base rounded-sm inline-block animate-pulse-fire"
            >
              🎵 Connect Spotify Account
            </a>
            <div className="mt-4 text-xs text-[--muted]">
              We only read your playlists. Nothing else.
            </div>
          </div>
        )}

        {/* STEP: Connected, idle */}
        {spotifyConnected && step === "idle" && (
          <div className="text-center animate-slide-up">
            <div className="font-display flame-text mb-4" style={{ fontSize: "72px", lineHeight: 1 }}>
              READY TO<br />GET COOKED?
            </div>
            <p className="text-[--muted] text-sm mb-10 max-w-md mx-auto">
              Your Spotify is connected. Let Gemini absolutely annihilate your music taste. No mercy.
            </p>
            <button onClick={fetchPlaylists} className="btn-spotify px-12 py-4 text-base rounded-sm animate-pulse-fire">
              🎵 Fetch My Playlists
            </button>
            <div className="mt-4">
              <a href="/api/spotify/connect" className="text-xs text-[--muted] hover:text-[--fire] transition-colors">
                Reconnect Spotify →
              </a>
            </div>
          </div>
        )}

        {/* STEP: Loading */}
        {(step === "fetching" || step === "roasting") && (
          <div className="text-center animate-slide-up">
            <div className="text-6xl mb-8 animate-float">{step === "fetching" ? "🎵" : "🔥"}</div>
            <div className="font-display text-3xl text-[--fire] mb-4">
              {step === "fetching" ? "FETCHING..." : "ROASTING..."}
            </div>
            <p className="text-[--muted] text-sm font-mono animate-flicker">{loadingMsg}</p>
          </div>
        )}

        {/* STEP: Select playlists */}
        {step === "selecting" && (
          <div className="animate-slide-up">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="font-display text-4xl text-[--text]">YOUR PLAYLISTS</h2>
                <p className="text-[--muted] text-xs mt-1">Select playlists to get roasted • {selected.size} selected</p>
              </div>
              <button onClick={getRoasted} disabled={selected.size === 0} className="btn-fire px-8 py-3 rounded-sm text-sm disabled:opacity-30 disabled:cursor-not-allowed">
                🔥 Roast Me ({selected.size})
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[60vh] overflow-y-auto scrollbar-hide pr-2">
              {playlists.map((pl) => (
                <button key={pl.id} onClick={() => toggleSelect(pl.id)}
                  className={`card text-left p-4 transition-all duration-200 hover:border-[--fire] ${selected.has(pl.id) ? "border-[--fire] bg-[rgba(255,69,0,0.08)]" : ""}`}>
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-sm flex-shrink-0 flex items-center justify-center text-xl"
                      style={{ background: pl.imageUrl ? `url(${pl.imageUrl}) center/cover` : "#1a1a1a" }}>
                      {!pl.imageUrl && "🎵"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-bold text-[--text] truncate">{pl.name}</div>
                      <div className="text-[10px] text-[--muted] mt-0.5">{pl.trackCount} tracks</div>
                      {pl.description && <div className="text-[10px] text-[--muted] mt-1 truncate opacity-60">{pl.description}</div>}
                    </div>
                    {selected.has(pl.id) && <span className="text-[--fire] text-lg flex-shrink-0">🔥</span>}
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-4 flex gap-3">
              <button onClick={() => setSelected(new Set(playlists.map((p) => p.id)))} className="text-xs text-[--muted] hover:text-[--fire] transition-colors">select all</button>
              <span className="text-[--border]">•</span>
              <button onClick={() => setSelected(new Set())} className="text-xs text-[--muted] hover:text-[--text] transition-colors">clear</button>
            </div>
          </div>
        )}

        {/* STEP: Roast result */}
        {step === "done" && (
          <div className="animate-roast-in max-w-2xl mx-auto">
            <div className="text-center mb-8">
              <div className="font-display text-5xl flame-text mb-2">YOU'VE BEEN</div>
              <div className="font-display text-7xl text-[--fire] animate-flicker">COOKED 🔥</div>
            </div>
            <div className="card p-8 border-[--fire] animate-pulse-fire" style={{ borderWidth: "1px" }}>
              <div className="text-xs text-[--fire] font-mono uppercase tracking-widest mb-4">— Gemini's Verdict —</div>
              <div className="text-[--text] leading-relaxed" style={{ fontSize: "15px" }}>
                {roast.split("\n").map((line, i) => <p key={i} className={line ? "mb-3" : "mb-1"}>{line}</p>)}
              </div>
            </div>
            <div className="flex gap-4 mt-8 justify-center">
              <button onClick={reset} className="btn-fire px-8 py-3 rounded-sm text-sm">🔥 Roast Me Again</button>
              <button onClick={() => navigator.clipboard.writeText(roast)} className="card px-8 py-3 text-sm text-[--muted] hover:text-[--text] transition-colors rounded-sm">📋 Copy Roast</button>
            </div>
          </div>
        )}

        {/* STEP: Error */}
        {step === "error" && (
          <div className="text-center animate-slide-up">
            <div className="text-6xl mb-6">💔</div>
            <div className="font-display text-4xl text-[--fire] mb-4">SOMETHING BROKE</div>
            <p className="text-[--muted] text-sm font-mono mb-6 max-w-md mx-auto">{error}</p>
            <div className="flex gap-4 justify-center">
              <button onClick={reset} className="btn-fire px-8 py-3 rounded-sm text-sm">Try Again</button>
              {!spotifyConnected && (
                <a href="/api/spotify/connect" className="btn-spotify px-8 py-3 rounded-sm text-sm inline-block">Reconnect Spotify</a>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

"use client";
import { SignInButton } from "@clerk/nextjs";

const emojis = ["🔥", "💀", "🤮", "😭", "💔", "🗑️"];

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      <div className="noise" />

      {/* Background grid */}
      <div
        className="fixed inset-0 opacity-5"
        style={{
          backgroundImage:
            "linear-gradient(var(--border) 1px, transparent 1px), linear-gradient(90deg, var(--border) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Glow blob */}
      <div
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-10 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, #FF4500 0%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-[--border]">
        <div className="font-display text-2xl flame-text">COOKED</div>
        <SignInButton mode="modal">
          <button className="btn-fire px-6 py-2 text-sm rounded-sm">
            Login with Spotify
          </button>
        </SignInButton>
      </header>

      {/* Hero */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 text-center">
        {/* Floating emojis */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {emojis.map((emoji, i) => (
            <span
              key={i}
              className="absolute text-3xl animate-float"
              style={{
                left: `${10 + i * 16}%`,
                top: `${20 + (i % 3) * 20}%`,
                animationDelay: `${i * 0.5}s`,
                opacity: 0.3,
              }}
            >
              {emoji}
            </span>
          ))}
        </div>

        <div className="animate-slide-up">
          <div className="text-sm text-[--muted] uppercase tracking-widest mb-4 font-mono">
            Your music taste is about to get
          </div>

          <h1
            className="font-display flame-text mb-6 animate-flicker"
            style={{ fontSize: "clamp(80px, 15vw, 180px)", lineHeight: 0.9 }}
          >
            ABSOLUTELY
            <br />
            COOKED
          </h1>

          <p
            className="text-[--muted] max-w-lg mx-auto mb-10 leading-relaxed"
            style={{ fontSize: "14px" }}
          >
            Connect your Spotify. We'll analyze your playlists.
            Then Gemini AI will roast your questionable music choices
            with zero mercy. 💀
          </p>

          <SignInButton mode="modal">
            <button
              className="btn-spotify px-10 py-4 text-base rounded-sm animate-pulse-fire"
              style={{ fontSize: "16px" }}
            >
              🎵 Connect Spotify & Get Roasted
            </button>
          </SignInButton>

          <div className="mt-6 text-xs text-[--muted]">
            No cap. Pure devastation. Free of charge.
          </div>
        </div>
      </main>

      {/* Footer stats */}
      <footer className="relative z-10 border-t border-[--border] px-8 py-6">
        <div className="flex items-center justify-center gap-12 text-xs text-[--muted]">
          {[
            ["🔥", "100% Brutally Honest"],
            ["💀", "AI-Powered Destruction"],
            ["🎵", "Spotify Connected"],
          ].map(([icon, label]) => (
            <div key={label} className="flex items-center gap-2">
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
}

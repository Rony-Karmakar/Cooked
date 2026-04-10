import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div>
        <div className="text-center mb-8">
          <div className="font-display text-5xl flame-text">COOKED</div>
          <div className="text-[--muted] text-sm mt-2">Login with Spotify to get roasted 🔥</div>
        </div>
        <SignIn />
      </div>
    </div>
  );
}

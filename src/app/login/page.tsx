"use client";

import { useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { BarChart3, Shield } from "lucide-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleGoogleLogin() {
    setLoading(true);
    setError(null);
    const supabase = createClient();

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center px-6 bg-[#09090b]">
      {/* Mesh gradient background */}
      <div className="absolute inset-0 mesh-gradient pointer-events-none" />
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-violet-600/15 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-flex flex-col items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500/20 to-indigo-500/20 border border-violet-500/20">
              <BarChart3 className="h-7 w-7 text-violet-400" />
            </div>
            <span className="text-2xl font-semibold tracking-tight text-zinc-100">
              IndiFin
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="glow-card rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-semibold text-zinc-100">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-500 mt-2">
              Sign in to track your mutual fund portfolio
            </p>
          </div>

          <div className="flex flex-col gap-4">
            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/20 p-3">
                <p className="text-sm text-red-400 text-center">{error}</p>
              </div>
            )}

            <Button
              className="shimmer-button w-full h-12 text-zinc-950 font-medium border-0 shadow-xl shadow-violet-500/20 hover:shadow-violet-500/30 transition-shadow"
              onClick={handleGoogleLogin}
              disabled={loading}
            >
              <svg className="mr-3 h-5 w-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {loading ? "Signing in..." : "Continue with Google"}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-zinc-800/50">
            <Shield className="h-4 w-4 text-zinc-600" />
            <p className="text-xs text-zinc-500">
              Your data is processed securely and never stored
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            &larr; Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}

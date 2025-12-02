// pages/signin.tsx
import React, { useState } from "react";
import { supabase } from "../lib/supabaseClient";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function signInWithGoogle() {
    const redirectTo = (process.env.NEXT_PUBLIC_SITE_URL || "") + "/dashboard";
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo },
    });
  }

  async function signInWithMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    if (!email) {
      setMessage("Please enter an email.");
      return;
    }

    const redirectTo = (process.env.NEXT_PUBLIC_SITE_URL || "") + "/dashboard";

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo },
    });

    if (error) setMessage(error.message);
    else setMessage("Magic link sent — check your email.");
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-slate-950 via-slate-900 to-black text-slate-50">
      {/* Navbar on dark background */}
     

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="bg-slate-900/70 border border-slate-800 rounded-2xl shadow-2xl shadow-black/60 backdrop-blur-xl p-6 sm:p-8">
            <div className="mb-6 text-center">
              <p className="text-xs uppercase tracking-[0.2em] text-purple-300/80 mb-2">
                Welcome back
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold">Sign in</h1>
              <p className="text-xs sm:text-sm text-slate-400 mt-1">
                Continue your MythFlair creations.
              </p>
            </div>

            {/* Google + link to Sign up */}
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center mb-5">
              <button
                type="button"
                onClick={signInWithGoogle}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2.5 text-xs sm:text-sm font-medium hover:bg-slate-900 transition-colors"
              >
                {/* Simple Google "G" circle */}
                <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-slate-900">
                  G
                </span>
                Sign in with Google
              </button>

              <a
                href="/signup"
                className="text-xs sm:text-sm text-slate-300 hover:text-white underline underline-offset-4 text-center sm:text-right"
              >
                Need an account? Sign up
              </a>
            </div>

            {/* Magic link form */}
            <form onSubmit={signInWithMagicLink} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-300">
                  Email (for magic link)
                </label>
                <input
                  type="email"
                  className="w-full rounded-lg border border-slate-700 bg-slate-950/60 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 placeholder:text-slate-500"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-lg bg-gradient-to-r from-purple-600 to-pink-600 py-2.5 text-sm font-semibold shadow-lg shadow-purple-900/40 hover:from-purple-500 hover:to-pink-500 active:scale-[0.98] transition-transform"
              >
                Send magic link
              </button>
            </form>

            {message && (
              <div className="mt-4 text-xs sm:text-sm text-slate-200 bg-slate-800/70 border border-slate-700 rounded-lg px-3 py-2">
                {message}
              </div>
            )}
          </div>

          <p className="mt-4 text-center text-[11px] text-slate-500">
            Having trouble signing in? Check your spam folder or try a different email.
          </p>
        </div>
      </main>
    </div>
  );
}

// pages/admin/login.tsx
import { useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setError("");
      setLoading(true);

      const origin =
        typeof window !== "undefined" ? window.location.origin : "";

      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/admin/studio`,
        },
      });

      if (error) {
        setError(error.message);
        setLoading(false);
      }
    } catch (err: any) {
      console.error(err);
      setError("Failed to start Google sign-in");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-neutral-100">
      <div className="w-full max-w-sm bg-neutral-900/70 border border-neutral-800 rounded-2xl p-6 space-y-4">
        <h1 className="text-lg font-semibold text-center">Admin Login</h1>
        <p className="text-xs text-neutral-400 text-center">
          Sign in with your admin Google account to access the studio.
        </p>

        {error && (
          <p className="text-xs text-red-400 bg-red-950/40 border border-red-900 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <button
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-white text-neutral-900 hover:bg-neutral-100 text-sm font-medium disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-neutral-400 border-t-neutral-900 rounded-full animate-spin" />
              <span>Redirecting to Google…</span>
            </>
          ) : (
            <>
              <div className="w-5 h-5 bg-white rounded-sm flex items-center justify-center">
                <span className="text-[10px] font-bold text-neutral-700">
                  G
                </span>
              </div>
              <span>Sign in with Google</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

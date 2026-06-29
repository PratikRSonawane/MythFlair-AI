import Head from "next/head";
import Link from "next/link";
import { FormEvent, useState } from "react";

const styles = {
  dark: {
    page: "bg-[#090b11] text-slate-100",
    panel: "border-white/10 bg-slate-900/60",
    subtle: "text-slate-400",
    button: "bg-white/5 text-yellow-400 hover:bg-white/10 border-white/10",
    input:
      "border-slate-800 bg-slate-950/60 text-white focus:border-fuchsia-500",
  },
  light: {
    page: "bg-slate-50 text-slate-900",
    panel: "border-slate-200 bg-white/70",
    subtle: "text-slate-500",
    button: "bg-white text-slate-750 hover:bg-slate-50 border-slate-200",
    input:
      "border-slate-200 bg-slate-50 text-slate-800 focus:border-fuchsia-500",
  },
} as const;

export default function PollinationsImageUrlPage() {
  const [isDark, setIsDark] = useState(true);
  const [prompt, setPrompt] = useState(
    "a mythic glass library floating above a quiet green city at sunrise"
  );

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [pendingImageUrl, setPendingImageUrl] = useState<string | null>(
    null
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string>("");

  const theme = isDark ? styles.dark : styles.light;

  const buildUrl = (p: string) => {
    const url = "https://image.pollinations.ai/image/" + encodeURIComponent(p);
    return `${url}?r=${Date.now()}`;
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();

    const p = prompt.trim();
    if (!p) {
      setMessage("Enter a prompt.");
      return;
    }

    setMessage("");
    setIsGenerating(true);
    setPendingImageUrl(null);

    try {
      setPendingImageUrl(buildUrl(p));
    } catch (err) {
      setIsGenerating(false);
      setMessage(err instanceof Error ? err.message : "Failed to generate URL.");
    }
  };

  const resetOutput = () => {
    setMessage("");
    setPendingImageUrl(null);
    setImageUrl(null);
    setIsGenerating(false);
  };

  return (
    <>
      <Head>
        <title>Low Polly Image Studio - MythFlair AI</title>
        <meta
          name="description"
          content="Generate low-polly style images by constructing image.pollinations.ai URLs in the browser (no API keys, no backend)."
        />
      </Head>

      <main className={`h-screen overflow-hidden flex flex-col ${theme.page}`}>
        <header
          className={`border-b ${
            isDark ? "border-white/5 bg-[#090b11]/90" : "border-slate-200 bg-white/70"
          }`}
        >
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <img
                src="/mythflair-logo.png"
                alt="MythFlair"
                className="h-10 w-10 rounded-md object-cover"
              />
              <div>
                <p className="font-black leading-none">MythFlair AI</p>
                <p
                  className={`mt-1 text-xs font-black uppercase tracking-[0.16em] ${
                    isDark ? "text-fuchsia-400" : "text-fuchsia-700"
                  }`}
                >
                  Low Polly Image Studio
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  const next = !isDark;
                  setIsDark(next);
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem(
                      "mythflair.pollinations.theme",
                      next ? "dark" : "light"
                    );
                  }
                }}
                className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${theme.button}`}
                aria-label="Toggle theme"
              >
                {isDark ? "🌙" : "☀️"}
              </button>

              <Link
                href="/"
                className={`rounded-2xl border px-4 py-2 text-xs font-bold transition ${
                  isDark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    : "border-slate-200 bg-white text-slate-750 hover:bg-slate-50"
                }`}
              >
                Back Home
              </Link>
            </div>
          </div>
        </header>

        <section className="flex-1 mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:py-8 overflow-hidden">
          <div className="grid gap-6 lg:grid-cols-[420px_1fr] h-full overflow-hidden">
            <form
              onSubmit={onSubmit}
              className={`rounded-[28px] border p-5 shadow-xl backdrop-blur-xl space-y-5 h-full overflow-hidden ${theme.panel}`}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-400">
                  No API
                </p>
                <h1
                  className={`mt-2 text-2xl font-black leading-tight ${
                    isDark ? "text-white" : "text-slate-900"
                  }`}
                >
                  low Polly Image ( /image generation )
                </h1>
                <p className={`mt-2.5 text-xs leading-5 ${theme.subtle}`}>
                  Builds a Prompt URL in the browser, then loads the image.
                </p>
              </div>

              <div className="flex flex-col gap-3 h-full">
                <div className="flex-0">
                  <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                    Prompt
                  </label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className={`mt-2 h-28 w-full resize-none rounded-2xl border p-3.5 text-sm leading-6 outline-none transition ${theme.input}`}
                    placeholder="Describe what you want to generate..."
                  />
                </div>

                <div className="flex-0">
                  <button
                    type="submit"
                    disabled={isGenerating}
                    className="mt-2 w-full rounded-2xl bg-gradient-to-r from-violet-650 to-fuchsia-600 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white shadow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGenerating ? "Rendering..." : "Generate"}
                  </button>
                </div>

                <div className="flex-1 overflow-hidden">
                  <div className="text-[10px] text-slate-500 leading-4">
                    Tip: this page does not ask user any API keys. It just constructs an image URL like:
                    <div
                      className={`mt-2 rounded-2xl border p-3 font-mono whitespace-pre-wrap ${
                        isDark
                          ? "bg-slate-950/40 border-white/10"
                          : "bg-white/60 border-slate-200"
                      }`}
                    >
                      {`const url = "https://*****************/" + encodeURIComponent(prompt);`}
                    </div>
                  </div>

                  {message && (
                    <p className="mt-3 text-xs border border-rose-400/20 bg-rose-500/5 text-rose-400 rounded-2xl p-3">
                      {message}
                    </p>
                  )}
                </div>
              </div>
            </form>

            <section
              className={`rounded-[28px] border p-5 shadow-sm h-full overflow-hidden flex flex-col ${
                isDark ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-white/40"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Output
                </h2>
                <div
                  className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-2xl border ${
                    isDark
                      ? "border-white/10 bg-white/5 text-slate-300"
                      : "border-slate-200 bg-white text-slate-750"
                  }`}
                >
                  Image Generation
                </div>
              </div>

              <div className="flex-1 overflow-hidden mt-4">
                <div
                  className={`h-full rounded-2xl border overflow-hidden flex items-center justify-center relative ${
                    isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                  }`}
                >
                  {!imageUrl && !isGenerating && (
                    <div className="text-center p-6 text-slate-400">
                      <span className="text-4xl block mb-2">💫</span>
                      <p className="text-sm font-bold text-slate-500">
                        Type a prompt, then Generate
                      </p>
                      <p className="text-xs mt-1">Image preview.</p>
                    </div>
                  )}

                  {(isGenerating || pendingImageUrl) && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                      <div className="h-10 w-10 rounded-full border-slate-200 border-4 border-t-fuchsia-500 animate-spin" />
                      <p className="text-xs font-black text-fuchsia-400 uppercase tracking-widest animate-pulse">
                        Generating
                      </p>
                    </div>
                  )}

                  {(imageUrl || pendingImageUrl) && (
                    <div className="w-full h-full p-2 flex flex-col">
                      <div className="flex-1 overflow-hidden rounded-xl">
                        <img
                          src={imageUrl ?? pendingImageUrl ?? ""}
                          alt="Pollinations generated"
                          className="w-full h-full object-contain rounded-xl"
                          onLoad={() => {
                            if (pendingImageUrl) setImageUrl(pendingImageUrl);
                            setPendingImageUrl(null);
                            setIsGenerating(false);
                          }}
                          onError={() => {
                            setPendingImageUrl(null);
                            setIsGenerating(false);
                            setMessage("Failed to load image.");
                          }}
                        />
                      </div>

                      <div className="mt-3 flex flex-col gap-2">
                        <div className="flex items-center justify-between gap-3">
                          <a
                            href={imageUrl ?? pendingImageUrl ?? ""}
                            download="pollinations-image"
                            className={`text-[11px] font-bold rounded-xl border px-3 py-1 transition ${
                              isDark
                                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                : "border-slate-200 bg-white text-slate-750 hover:bg-slate-50"
                            }`}
                          >
                            Download
                          </a>

                          <button
                            type="button"
                            onClick={resetOutput}
                            className={`text-[11px] font-bold rounded-xl border px-3 py-1 transition ${
                              isDark
                                ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                                : "border-slate-200 bg-white text-slate-750 hover:bg-slate-50"
                            }`}
                          >
                            Reset
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}


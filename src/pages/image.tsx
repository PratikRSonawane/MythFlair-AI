import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useMemo, useRef, useState } from "react";

type ModelOption = {
  id: "turbo" | "flux" | "flux-schnell" | "magic" | "wan" | "default";
  label: string;
  provider: string;
  note: string;
};

const models: ModelOption[] = [
  { id: "turbo", label: "Turbo", provider: "MitraAi", note: "Fast general-purpose generation" },
  { id: "flux", label: "Flux", provider: "MitraAi", note: "Balanced quality and speed" },
  { id: "flux-schnell", label: "Flux Schnell", provider: "MitraAi", note: "Speed-focused creative output" },
  { id: "magic", label: "Magic", provider: "MagicStudio", note: "Polished visual synthesis" },
  { id: "wan", label: "Wan", provider: "Qwen.ai", note: "Alternative provider-backed model" },
  { id: "default", label: "Default", provider: "MitraAi", note: "Falls back to magic when unspecified" },
];

const defaultPrompt =
  "A cinematic black and white portrait of a futuristic city explorer, dramatic lighting, premium editorial style";

export default function ImageStudioPage() {
  const [isDark, setIsDark] = useState(true);
  const [prompt, setPrompt] = useState(defaultPrompt);
  const [selectedModel, setSelectedModel] = useState<ModelOption["id"]>("magic");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [message, setMessage] = useState("Ready to generate.");
  const [imageSeed, setImageSeed] = useState(0);
  const abortRef = useRef<AbortController | null>(null);

  const selectedModelData = useMemo(
    () => models.find((model) => model.id === selectedModel) ?? models[0],
    [selectedModel]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = window.localStorage.getItem("mythflair.subnp.theme");
      if (savedTheme === "light") setIsDark(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mythflair.subnp.theme", isDark ? "dark" : "light");
    }
  }, [isDark]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleGenerate = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setMessage(`Generating with ${selectedModelData.label}...`);
    setGeneratedImage(null);
    setImageSeed(Math.floor(Math.random() * 1000000));

    try {
      const response = await fetch("/api/subnp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, model: selectedModel }),
        signal: controller.signal,
      });

      if (!response.body) throw new Error("No response body received.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const events = buffer.split("\n\n");
        buffer = events.pop() || "";

        for (const entry of events) {
          if (!entry.startsWith("data:")) continue;

          try {
            const json = JSON.parse(entry.replace("data:", "").trim());

            if (json.status === "processing") {
              setMessage(json.message || "Processing...");
            }

            if (json.status === "complete") {
              setGeneratedImage(json.imageUrl);
              setMessage("Generation complete.");
              setIsGenerating(false);
            }

            if (json.status === "error") {
              setMessage(json.error || json.message || "Generation failed.");
              setIsGenerating(false);
            }
          } catch {
            // Ignore malformed SSE frames.
          }
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unexpected failure.";
      setMessage(errorMessage);
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) return;

    try {
      const response = await fetch(generatedImage);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `mythflair-subnp-${imageSeed || "image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      window.open(generatedImage, "_blank");
    }
  };

  return (
    <>
      <Head>
        <title>Image Studio - MythFlair AI</title>
        <meta
          name="description"
          content="Professional image studio with black and white mode, model selection, and live generation output."
        />
      </Head>

      <Script src="https://js.puter.com/v2/" strategy="afterInteractive" />

      <main
        className={`relative min-h-screen overflow-y-auto font-sans transition-colors duration-300 ${
          isDark ? "bg-[#090b11] text-slate-100 selection:bg-fuchsia-500/30" : "bg-slate-50 text-slate-900 selection:bg-fuchsia-500/20"
        }`}
      >
        <header className={`sticky top-0 z-50 border-b transition-all ${isDark ? "border-white/5 bg-[#090b11]/90" : "border-slate-200 bg-white/70 backdrop-blur-xl"}`}>
          <div className="mx-auto flex min-h-16 max-w-7xl items-center justify-between gap-3 whitespace-nowrap px-4 py-3 sm:px-8 md:min-h-20">
            <Link href="/" className="flex min-w-0 items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/mythflair-logo.png" alt="MythFlair" className="h-8 w-8 rounded-md object-cover sm:h-10 sm:w-10" />
              <div className="min-w-0">
                <p className="truncate text-sm font-black leading-none sm:text-base">Image Studio</p>
                <p className={`mt-1 text-[10px] font-black uppercase tracking-[0.16em] sm:text-xs ${isDark ? "text-fuchsia-400" : "text-fuchsia-700"}`}>
                  Creative Workspace
                </p>
              </div>
            </Link>

            <div className="flex shrink-0 items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => setIsDark((value) => !value)}
                className={`flex h-10 w-10 items-center justify-center rounded-2xl border transition sm:h-11 sm:w-11 ${
                  isDark ? "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10" : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                }`}
                aria-label="Toggle black and white mode"
              >
                {isDark ? (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2" />
                    <path d="M12 21v2" />
                    <path d="M4.22 4.22l1.42 1.42" />
                    <path d="M18.36 18.36l1.42 1.42" />
                    <path d="M1 12h2" />
                    <path d="M21 12h2" />
                    <path d="M4.22 19.78l1.42-1.42" />
                    <path d="M18.36 5.64l1.42-1.42" />
                  </svg>
                ) : (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[390px_1fr]">
            <form
              onSubmit={handleGenerate}
              className={`order-2 flex min-h-0 flex-col rounded-[28px] border p-4 shadow-xl backdrop-blur-xl sm:p-5 lg:order-1 ${
                isDark ? "border-white/10 bg-slate-900/60" : "border-slate-200 bg-white/80"
              }`}
            >
              <div className="mt-1 flex-1 space-y-4">
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Select Model</label>
                  <div className={`mt-2 rounded-2xl border p-3 ${isDark ? "border-slate-800 bg-slate-950/60" : "border-slate-200 bg-white"}`}>
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <strong className={`block text-sm ${isDark ? "text-white" : "text-slate-900"}`}>{selectedModelData.label}</strong>
                        <span className={`block text-[10px] uppercase tracking-[0.14em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                          {selectedModelData.provider}
                        </span>
                      </div>
                      <select
                        value={selectedModel}
                        onChange={(event) => setSelectedModel(event.target.value as ModelOption["id"])}
                        className={`rounded-xl border px-3 py-2 text-xs font-bold outline-none ${
                          isDark ? "border-white/10 bg-slate-900 text-slate-100" : "border-slate-200 bg-white text-slate-900"
                        }`}
                        aria-label="Select model"
                      >
                        {models.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <p className={`mt-3 text-[11px] leading-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {selectedModelData.note}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Prompt</label>
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    className={`mt-2 h-32 w-full resize-none rounded-2xl border p-3.5 text-sm leading-6 outline-none transition ${
                      isDark ? "border-slate-800 bg-slate-950/60 text-white focus:border-fuchsia-500" : "border-slate-200 bg-slate-50 text-slate-800 focus:border-fuchsia-500"
                    }`}
                    placeholder="Describe what you want to render..."
                  />
                </div>

                <div className={`rounded-2xl border p-4 ${isDark ? "border-white/5 bg-slate-950/20" : "border-slate-200 bg-slate-50/50"}`}>
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className={`block text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>Generate Image</span>
                      <span className={`mt-0.5 block text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>Launch the render from this workspace.</span>
                    </div>
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="rounded-2xl bg-gradient-to-r from-violet-650 to-fuchsia-600 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white shadow transition hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isGenerating ? "Rendering..." : "Generate"}
                    </button>
                  </div>
                </div>
              </div>

              <p
                className={`mt-4 rounded-2xl border p-3 text-xs leading-5 whitespace-pre-wrap ${
                  message.startsWith("Error")
                    ? isDark
                      ? "border-rose-500/20 bg-rose-500/5 text-rose-400"
                      : "border-rose-200 bg-rose-50 text-rose-700"
                    : isDark
                      ? "border-white/5 bg-slate-950/30 text-slate-300"
                      : "border-slate-200 bg-slate-50 text-slate-650"
                }`}
              >
                {message}
              </p>
            </form>

            <section
              className={`order-1 flex min-h-[320px] flex-col rounded-[28px] border p-4 shadow-sm sm:p-5 lg:order-2 lg:min-h-[420px] ${
                isDark ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-white/40"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Generated Output</h2>
                  <p className={`text-xs uppercase tracking-[0.16em] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                    {selectedModelData.label} · {selectedModelData.provider}
                  </p>
                </div>
                {generatedImage && (
                  <button
                    type="button"
                    onClick={downloadImage}
                    className={`rounded-2xl border px-4 py-2 text-xs font-bold transition ${
                      isDark ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-slate-200 bg-white text-slate-750 hover:bg-slate-50"
                    }`}
                  >
                    Download File
                  </button>
                )}
              </div>

              <div
                className={`mt-4 flex min-h-0 flex-1 items-center justify-center overflow-hidden rounded-2xl border border-dashed ${
                  isDark ? "border-white/10 bg-slate-950/20" : "border-slate-200 bg-slate-50/50"
                }`}
              >
                {isGenerating ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-fuchsia-500" />
                    <p className="animate-pulse text-xs font-black uppercase tracking-widest text-fuchsia-600">Generating</p>
                  </div>
                ) : generatedImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img
                    src={generatedImage}
                    alt="Generated artwork"
                    className="max-h-full w-auto max-w-full rounded-2xl object-contain shadow-lg"
                  />
                ) : (
                  <div className="max-w-sm p-6 text-center text-slate-400">
                    <span className="mb-2 block text-4xl">💫</span>
                    <p className="text-sm font-bold text-slate-500">Image Studio Ready</p>
                    <p className="mt-1 text-xs">
                      Choose a model, write your prompt, and generate from this admin-style workspace.
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </section>
      </main>
    </>
  );
}

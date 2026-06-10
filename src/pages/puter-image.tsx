import Head from "next/head";
import Link from "next/link";
import Script from "next/script";
import { useEffect, useState, useMemo } from "react";

type ImageModel = {
  id: string;
  label: string;
  note: string;
  api: "txt2img" | "chat";
};

const imageModels: ImageModel[] = [
  {
    id: "gemini-2.5-flash-image",
    label: "Gemini 2.5 Flash Image",
    note: "Google's fast multimodal generation (Chat API)",
    api: "chat",
  },
  {
    id: "gpt-image-1.5",
    label: "GPT Image 1.5",
    note: "Puter's standard text-to-image",
    api: "txt2img",
  },
  {
    id: "gpt-image-2",
    label: "GPT Image 2",
    note: "Puter's advanced text-to-image",
    api: "txt2img",
  },
  {
    id: "dall-e-3",
    label: "DALL-E 3",
    note: "OpenAI's high-fidelity creative model",
    api: "txt2img",
  },
  {
    id: "dall-e-2",
    label: "DALL-E 2",
    note: "OpenAI's classic fast generator",
    api: "txt2img",
  },
  {
    id: "flux.1-schnell",
    label: "Flux Schnell",
    note: "Ultra-fast, photorealistic details",
    api: "txt2img",
  },
  {
    id: "stable-diffusion-xl",
    label: "Stable Diffusion XL",
    note: "Stability AI's classic open generator",
    api: "txt2img",
  },
];

const ratios = [
  { label: "Square", value: "1:1", width: 1024, height: 1024 },
  { label: "Wide", value: "16:9", width: 1344, height: 768 },
  { label: "Portrait", value: "9:16", width: 768, height: 1344 },
  { label: "Classic", value: "4:3", width: 1152, height: 864 },
];

const qualities = [
  { label: "Low", value: "low" },
  { label: "Medium", value: "medium" },
  { label: "High", value: "high" },
];

export default function ImageStudioPage() {
  const [isDark, setIsDark] = useState(true);
  const [prompt, setPrompt] = useState("A colorful glass library floating in a quiet green city at sunrise");
  const [selectedModel, setSelectedModel] = useState(imageModels[0].id);
  const [ratioValue, setRatioValue] = useState(ratios[0].value);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [imageSeed, setImageSeed] = useState(0);
  const [isPuterLoaded, setIsPuterLoaded] = useState(false);
  const [testMode, setTestMode] = useState(true);
  const [selectedQuality, setSelectedQuality] = useState("low");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = window.localStorage.getItem("mythflair.pollinations.theme");
      if (savedTheme === "light") {
        setIsDark(false);
      }

      // Check if Puter SDK is already loaded
      if ((window as any).puter) {
        setIsPuterLoaded(true);
      }
    }
  }, []);

  const selectedRatio = useMemo(
    () => ratios.find((ratio) => ratio.value === ratioValue) ?? ratios[0],
    [ratioValue]
  );

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isGenerating) return;

    const puter = (window as any).puter;
    if (!puter) {
      setMessage("Puter SDK is not loaded yet. Please wait for connection.");
      return;
    }

    setIsGenerating(true);
    setMessage("");
    setGeneratedImage(null);

    const seed = Math.floor(Math.random() * 1000000);
    setImageSeed(seed);

    try {
      const modelObj = imageModels.find((m) => m.id === selectedModel);
      if (!modelObj) throw new Error("Selected model is not supported");

      if (modelObj.api === "chat") {
        // Chat image generation (e.g. Gemini 2.5 Flash Image)
        const result = await puter.ai.chat(prompt, testMode, {
          model: modelObj.id,
        });

        if (result?.message?.images?.length > 0) {
          const url = result.message.images[0].image_url.url;
          setGeneratedImage(url);
          if (result.message.content) {
            setMessage(result.message.content);
          } else {
            setMessage(`Image generated via ${modelObj.label}.`);
          }
        } else {
          throw new Error("No image was returned in the chat response.");
        }
      } else {
        // Txt2img generation (e.g. DALL-E 3, GPT-Image 1.5, Flux, Stable Diffusion)
        const options: any = {
          model: modelObj.id,
          quality: selectedQuality,
          width: selectedRatio.width,
          height: selectedRatio.height,
        };

        const imageElement = await puter.ai.txt2img(prompt, options);

        if (imageElement && imageElement.src) {
          setGeneratedImage(imageElement.src);
          setMessage(`Image generated via ${modelObj.label}.`);
        } else {
          throw new Error("Puter did not return a valid image element.");
        }
      }
    } catch (err: any) {
      console.error("Puter model generation failed:", err);
      setMessage(`Error generating image: ${err?.message || err || "Unknown error"}`);
    } finally {
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
      link.download = `mythflair-${imageSeed || "image"}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.warn("Direct download failed, attempting new-tab fallback:", err);
      window.open(generatedImage, "_blank");
    }
  };

  return (
    <>
      <Head>
        <title>Image Studio - MythFlair AI</title>
      </Head>

      <Script
        src="https://js.puter.com/v2/"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Puter SDK loaded");
          setIsPuterLoaded(true);
        }}
        onError={() => {
          console.error("Puter SDK load failed");
        }}
      />

      <main className={`relative min-h-screen overflow-hidden transition-colors duration-300 font-sans flex flex-col ${
        isDark ? "bg-[#090b11] text-slate-100 selection:bg-fuchsia-500/30" : "bg-slate-50 text-slate-900 selection:bg-fuchsia-500/20"
      }`}>
        <header className={`border-b transition-all ${isDark ? "border-white/5 bg-[#090b11]/90" : "border-slate-200 bg-white/70 backdrop-blur-xl"}`}>
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Link href="/puter-ai" className="flex items-center gap-3">
              <img
                src="/mythflair-logo.png"
                alt="MythFlair"
                className="h-10 w-10 rounded-md object-cover"
              />
              <div>
                <p className="font-black leading-none">Image Studio</p>
                <p className={`mt-1 text-xs font-black uppercase tracking-[0.16em] ${isDark ? "text-fuchsia-400" : "text-fuchsia-700"}`}>
                  Workspace Hub
                </p>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              {/* Puter SDK connection indicator */}
              <div className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-2xl border text-[10px] font-black uppercase tracking-wider transition-all duration-300 ${
                isPuterLoaded 
                  ? (isDark ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-700")
                  : (isDark ? "border-amber-500/25 bg-amber-500/10 text-amber-400 animate-pulse" : "border-amber-200 bg-amber-50 text-amber-700 animate-pulse")
              }`}>
                <span className={`h-1.5 w-1.5 rounded-full ${isPuterLoaded ? "bg-emerald-500" : "bg-amber-500"}`} />
                {isPuterLoaded ? "Puter SDK Active" : "Connecting SDK"}
              </div>

              <button
                type="button"
                onClick={() => {
                  const newTheme = !isDark;
                  setIsDark(newTheme);
                  if (typeof window !== "undefined") {
                    window.localStorage.setItem("mythflair.pollinations.theme", newTheme ? "dark" : "light");
                  }
                }}
                className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                  isDark
                    ? "border-white/10 bg-white/5 text-yellow-400 hover:bg-white/10"
                    : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {isDark ? (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m0-12.728l.707.707m12.728 12.728l.707-.707M12 8a4 4 0 100 8 4 4 0 000-8z" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>
              <Link
                href="/puter-ai"
                className={`rounded-2xl border px-4 py-2 text-xs font-bold transition ${
                  isDark ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10" : "border-slate-200 bg-white text-slate-750 hover:bg-slate-50"
                }`}
              >
                Exit Workspace
              </Link>
            </div>
          </div>
        </header>

        <section className="flex-1 mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[390px_1fr] lg:py-10 w-full">
          <form
            onSubmit={handleGenerate}
            className={`rounded-[28px] border p-5 shadow-xl backdrop-blur-xl space-y-5 h-fit ${
              isDark ? "border-white/10 bg-slate-900/60" : "border-slate-200 bg-white/80"
            }`}
          >
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-500">
                Workspace Setup
              </p>
              <h1 className={`mt-2 text-2xl font-black leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                Image Generation
              </h1>
              <p className={`mt-2.5 text-xs leading-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                Configure Puter model capabilities and dimensions to generate artworks from prompts.
              </p>
            </div>

            {/* Models list */}
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Select Model
              </label>
              <div className="mt-2 grid grid-cols-1 gap-2 max-h-56 overflow-y-auto pr-1">
                {imageModels.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedModel(item.id)}
                    className={`rounded-2xl border p-3.5 text-left transition duration-205 cursor-pointer ${
                      selectedModel === item.id
                        ? (isDark ? "border-fuchsia-500 bg-fuchsia-950/20" : "border-fuchsia-500 bg-fuchsia-50/50")
                        : (isDark ? "border-white/5 bg-slate-950/30 hover:border-white/15" : "border-slate-200 bg-slate-50 hover:border-slate-300")
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`block text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                        {item.label}
                      </span>
                      <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                        item.api === "chat" 
                          ? (isDark ? "bg-violet-500/10 text-violet-400 border border-violet-500/20" : "bg-violet-100 text-violet-750")
                          : (isDark ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" : "bg-cyan-100 text-cyan-750")
                      }`}>
                        {item.api}
                      </span>
                    </div>
                    <span className={`mt-1 block text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      {item.note}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Prompt */}
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                className={`mt-2 h-24 w-full resize-none rounded-2xl border p-3.5 text-sm leading-6 outline-none transition ${
                  isDark ? "border-slate-800 bg-slate-950/60 text-white focus:border-fuchsia-500" : "border-slate-200 bg-slate-50 text-slate-800 focus:border-fuchsia-500"
                }`}
                placeholder="Describe what you want to render..."
              />
            </div>

            {/* Ratio selection */}
            <div>
              <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                Ratio
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {ratios.map((ratio) => (
                  <button
                    key={ratio.value}
                    type="button"
                    onClick={() => setRatioValue(ratio.value)}
                    className={`rounded-2xl border px-3.5 py-2.5 text-left text-xs font-bold transition duration-200 cursor-pointer ${
                      ratioValue === ratio.value
                        ? (isDark ? "border-amber-500 bg-amber-950/20 text-amber-400" : "border-amber-500 bg-amber-50/50 text-amber-800")
                        : (isDark ? "border-white/5 bg-slate-950/30 text-slate-350 hover:border-white/15" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300")
                    }`}
                  >
                    {ratio.label}
                    <span className="block text-[10px] font-medium opacity-70 mt-0.5">
                      {ratio.value}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality selection (only applicable to txt2img models) */}
            {imageModels.find((m) => m.id === selectedModel)?.api === "txt2img" && (
              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                  Rendering Quality
                </label>
                <div className="mt-2 grid grid-cols-3 gap-2">
                  {qualities.map((q) => (
                    <button
                      key={q.value}
                      type="button"
                      onClick={() => setSelectedQuality(q.value)}
                      className={`rounded-2xl border px-3 py-2 text-center text-xs font-bold transition duration-200 cursor-pointer ${
                        selectedQuality === q.value
                          ? (isDark ? "border-cyan-500 bg-cyan-950/20 text-cyan-400" : "border-cyan-500 bg-cyan-50/50 text-cyan-800")
                          : (isDark ? "border-white/5 bg-slate-950/30 text-slate-350 hover:border-white/15" : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300")
                      }`}
                    >
                      {q.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Test Mode Toggle */}
            {imageModels.find((m) => m.id === selectedModel)?.api === "chat" && (
              <div className={`rounded-2xl border p-4 transition-all ${
                isDark ? "border-white/5 bg-slate-950/20" : "border-slate-200 bg-slate-50/50"
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <span className={`block text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                      Test Mode (Free)
                    </span>
                    <span className={`mt-0.5 block text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                      Run without consuming API credits.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTestMode(!testMode)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                      testMode ? "bg-fuchsia-600" : (isDark ? "bg-slate-800" : "bg-slate-300")
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        testMode ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isGenerating || !isPuterLoaded}
              className="mt-6 w-full rounded-2xl bg-gradient-to-r from-violet-650 to-fuchsia-600 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white shadow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? "Rendering..." : !isPuterLoaded ? "Loading Puter..." : "Generate Image"}
            </button>


            {message && (
              <p className={`mt-4 rounded-2xl border p-3 text-xs leading-5 whitespace-pre-wrap ${
                message.startsWith("Error")
                  ? (isDark ? "border-rose-500/20 bg-rose-500/5 text-rose-400" : "border-rose-200 bg-rose-50 text-rose-700")
                  : (isDark ? "border-white/5 bg-slate-950/30 text-slate-300" : "border-slate-200 bg-slate-50 text-slate-650")
              }`}>
                {message}
              </p>
            )}
          </form>

          <section className={`rounded-[28px] border p-5 shadow-sm min-h-[500px] flex flex-col ${
            isDark ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-white/40"
          }`}>
            <div className="flex items-center justify-between">
              <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Generated Output</h2>
              {generatedImage && (
                <button
                  type="button"
                  onClick={downloadImage}
                  className={`rounded-2xl border px-4 py-2 text-xs font-bold transition cursor-pointer ${
                    isDark ? "border-white/10 bg-white/5 text-slate-350 hover:bg-white/10" : "border-slate-200 bg-white text-slate-750 hover:bg-slate-50"
                  }`}
                >
                  Download File
                </button>
              )}
            </div>

            <div className={`flex-1 mt-4 relative flex items-center justify-center rounded-2xl border border-dashed overflow-hidden min-h-[400px] ${
              isDark ? "border-white/10 bg-slate-950/20" : "border-slate-200 bg-slate-50/50"
            }`}>
              {isGenerating ? (
                <div className="flex flex-col items-center gap-3">
                  <div className="h-10 w-10 rounded-full border-4 border-slate-200 border-t-fuchsia-500 animate-spin" />
                  <p className="text-xs font-black text-fuchsia-600 uppercase tracking-widest animate-pulse">Generating</p>
                </div>
              ) : generatedImage ? (
                <img
                  src={generatedImage}
                  alt="Generated artwork"
                  className="max-h-[70vh] w-auto max-w-full rounded-2xl object-contain shadow-lg relative z-10"
                />
              ) : (
                <div className="text-center p-6 text-slate-400">
                  <span className="text-4xl block mb-2">🎨</span>
                  <p className="text-sm font-bold text-slate-500">Image Studio Ready</p>
                  <p className="text-xs mt-1">Configure models and ratios to launch rendering.</p>
                </div>
              )}
            </div>
          </section>
        </section>
      </main>
    </>
  );
}


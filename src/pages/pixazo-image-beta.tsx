import Head from "next/head";
import Link from "next/link";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";


type Model =
  | "pixazo-flux-1-schnell"
  | "pixazo-sd"
  | "pixazo-sd-inpainting"
  | "pixazo-sdxl";

type Ratio = {
  label: string;
  value: string;
  width: number;
  height: number;
};

const ratios: Ratio[] = [
  { label: "Square", value: "1:1", width: 1024, height: 1024 },
  { label: "Wide", value: "16:9", width: 1344, height: 768 },
  { label: "Portrait", value: "9:16", width: 768, height: 1344 },
  { label: "Classic", value: "4:3", width: 1152, height: 864 },
];

const models: { id: Model; label: string; note: string }[] = [
  {
    id: "pixazo-flux-1-schnell",
    label: "Pixazo Flux 1 Schnell",
    note: "Batch Text-to-Image (Free tier listing)",
  },
  {
    id: "pixazo-sd",
    label: "Pixazo Stable Diffusion",
    note: "Stable Diffusion Text-to-Image (Free tier listing)",
  },
  {
    id: "pixazo-sd-inpainting",
    label: "Pixazo Stable Diffusion Inpainting",
    note: "Inpaint: needs mask",
  },
  {
    id: "pixazo-sdxl",
    label: "Pixazo SDXL",
    note: "SDXL Text-to-Image (Free tier listing)",
  },
];

const pixazoBaseUrl = "https://gateway.pixazo.ai";

function getModelBasePath(model: Model) {
  // Pixazo docs provided base path for Flux Schnell.
  // For other models, we map to conventional Pixazo catalog routes.
  // If your Pixazo catalog uses different model paths, update these strings.
  switch (model) {
    case "pixazo-flux-1-schnell":
      return `${pixazoBaseUrl}/flux-1-schnell`;
    case "pixazo-sd":
      return `${pixazoBaseUrl}/stable-diffusion`;
    case "pixazo-sd-inpainting":
      return `${pixazoBaseUrl}/stable-diffusion-inpainting`;
    case "pixazo-sdxl":
      return `${pixazoBaseUrl}/sdxl`;
    default:
      return `${pixazoBaseUrl}/flux-1-schnell`;
  }
}

function getPromptExamples(model: Model) {
  if (model === "pixazo-sd-inpainting") {
    return [
      "remove the scar from the woman's face and keep the lighting consistent",
      "replace the sky with a sunset while preserving the buildings",
      "add a glowing magical rune on the door",
    ];
  }

  if (model === "pixazo-flux-1-schnell") {
    return [
      "a cyberpunk cat in neon rain, cinematic lighting",
      "an astronaut floating above a purple nebula, ultra-detailed",
      "a steampunk owl reading a book under warm lantern light",
    ];
  }

  if (model === "pixazo-sdxl") {
    return [
      "a photoreal portrait of a young woman in soft natural light",
      "a fantasy forest scene with volumetric fog, ultra realistic",
      "a product shot of a glass dragon figurine on marble",
    ];
  }

  return [
    "a mythic glass library floating above a quiet green city at sunrise",
    "portrait of a wizard with glowing runes, magical atmosphere",
    "dragon made of stained glass, high detail, soft volumetric light",
  ];
}

function dataUrlToFilename(dataUrl: string, fallback: string) {
  // data:image/png;base64,...
  const match = dataUrl.match(/^data:([^;]+);base64,/i);
  const mime = match?.[1] ?? "image/png";
  const ext = mime.includes("jpeg") ? "jpg" : mime.includes("webp") ? "webp" : mime.includes("gif") ? "gif" : "png";
  return `${fallback}.${ext}`;
}

export default function PixazoImageBetaPage() {
  const [isDark, setIsDark] = useState(true);

  const [model, setModel] = useState<Model>("pixazo-flux-1-schnell");
  const [ratioValue, setRatioValue] = useState(ratios[0].value);
  const selectedRatio = useMemo(
    () => ratios.find((r) => r.value === ratioValue) ?? ratios[0],
    [ratioValue]
  );

  const [prompt, setPrompt] = useState(
    "A cyberpunk cat in neon rain, cinematic lighting"
  );

  const [numSteps, setNumSteps] = useState(4);
  const [seed, setSeed] = useState<number | null>(null);
  const [count, setCount] = useState(4);

  // Inpainting inputs
  const [maskPrompt, setMaskPrompt] = useState(
    "Replace the masked area while keeping the original lighting."
  );
  const [hasMask, setHasMask] = useState(false);
  const [maskDataUrl, setMaskDataUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [images, setImages] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState<string>("");

  const examples = useMemo(() => getPromptExamples(model), [model]);

  useEffect(() => {
    // Basic UX: if inpainting selected, show mask controls.
    setHasMask(false);
    setMaskDataUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, [model]);

  const isInpainting = model === "pixazo-sd-inpainting";

  const getEndpoint = () => {
    const basePath = getModelBasePath(model);

    // Pixazo docs: batch endpoint for flux-1-schnell
    // For other models, we assume same suffixes.
    // If these differ, update here.
    return {
      batch: `${basePath}/v1/getDataBatch`,
      status: `${basePath}/v1/checkStatus`,
    };
  };

  async function pollStatus(jobId: string, statusUrl: string) {
    // Exponential-ish backoff but capped.
    let delay = 800;
    const maxDelay = 5000;
    for (let attempt = 0; attempt < 120; attempt++) {
      const r = await fetch(statusUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Secret-Key": process.env.NEXT_PUBLIC_PIXAZO_API_KEY ?? "", // fallback
        },
        body: JSON.stringify({ jobId }),
      });

      if (!r.ok) {
        const t = await r.text().catch(() => "");
        throw new Error(`Pixazo status check failed: ${t || r.status}`);
      }

      const data = (await r.json()) as any;
      const state = data?.status ?? data?.state ?? data?.jobStatus;
      if (state === "completed" || state === "succeeded" || data?.result) return data;
      if (state === "failed" || state === "error") {
        throw new Error(data?.error ?? "Pixazo generation failed");
      }

      await new Promise((res) => setTimeout(res, delay));
      delay = Math.min(maxDelay, Math.floor(delay * 1.25));
    }

    throw new Error("Pixazo job timed out");
  }

  const generate = async (event: FormEvent) => {
    event.preventDefault();

    if (!prompt.trim()) {
      setMessage("Add a prompt.");
      return;
    }

    if (isInpainting && !maskDataUrl) {
      setMessage("Add a mask image for inpainting.");
      return;
    }

    setMessage("");
    setIsGenerating(true);
    setImages([]);

    try {
      const { batch, status } = getEndpoint();

      const secretKey = process.env.NEXT_PUBLIC_PIXAZO_API_KEY;
      if (!secretKey) {
        throw new Error(
          "Missing Pixazo env var. Set NEXT_PUBLIC_PIXAZO_API_KEY in your environment so the beta page can call Pixazo."
        );
      }

      const payload: any = {
        prompt: prompt.trim(),
        width: selectedRatio.width,
        height: selectedRatio.height,
        num_steps: numSteps,
        seed: seed ?? undefined,
        // batch request fields can vary; keep common ones.
        num_images: count,
      };

      if (isInpainting) {
        payload.mask_image = maskDataUrl;
        payload.inpaint_prompt = maskPrompt;
      }

      const res = await fetch(
        "/api/pixazo/generate-batch",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...payload,
            model,
          }),
        }
      );


      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`Pixazo batch failed: ${t || res.status}`);
      }

      const data = (await res.json()) as any;
      const jobId = data?.jobId ?? data?.job_id ?? data?.id;
      if (!jobId) {
        // Some APIs may return direct results
        if (data?.images?.length) {
          setImages(data.images);
          setMessage(`Generated ${data.images.length} image(s).`);
          return;
        }
        throw new Error("Pixazo batch did not return a jobId");
      }

      const finalData = await pollStatus(jobId, status);

      const imgs: string[] =
        finalData?.images ?? finalData?.results ?? finalData?.data?.images ?? [];

      if (!imgs.length) {
        throw new Error("Pixazo job completed but no images were returned");
      }

      setImages(imgs);
      setMessage(`Generated ${imgs.length} image(s).`);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Generation failed.");
    } finally {
      setIsGenerating(false);
    }
  };

  const onPickMaskFile = async (file: File | null) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : null;
      setMaskDataUrl(result);
      setHasMask(true);
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      <Head>
        <title>Pixazo Image Beta - MythFlair AI</title>
        <meta name="description" content="Beta Pixazo image generation + inpainting for MythFlair" />
      </Head>

      <main
        className={`min-h-screen flex flex-col ${
          isDark ? "bg-[#090b11] text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
      >
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
                  Pixazo Beta Studio
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
                className={`p-2 rounded-2xl border transition-all cursor-pointer flex items-center justify-center ${
                  isDark
                    ? "border-white/10 bg-white/5 text-yellow-400 hover:bg-white/10"
                    : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
                aria-label="Toggle theme"
              >
                {isDark ? "🌙" : "☀️"}
              </button>

              <Link
                href="/creative-studio"
                className={`rounded-2xl border px-4 py-2 text-xs font-bold transition ${
                  isDark
                    ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                    : "border-slate-200 bg-white text-slate-750 hover:bg-slate-50"
                }`}
              >
                Back to Studio
              </Link>
            </div>
          </div>
        </header>

        <section className="flex-1 mx-auto w-full max-w-7xl px-5 py-6 sm:px-8 lg:py-10">
          <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
            <form
              onSubmit={generate}
              className={`rounded-[28px] border p-5 shadow-xl backdrop-blur-xl space-y-5 h-fit ${
                isDark ? "border-white/10 bg-slate-900/60" : "border-slate-200 bg-white/80"
              }`}
            >
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-fuchsia-400">Beta</p>
                <h1 className={`mt-2 text-2xl font-black leading-tight ${isDark ? "text-white" : "text-slate-900"}`}>
                  Pixazo Image Generation
                </h1>
                <p className={`mt-2.5 text-xs leading-5 ${isDark ? "text-slate-400" : "text-slate-500"}`}>
                  Uses <span className="font-mono">pixazo_api</span> (env) via this page test harness.
                </p>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Select Model</label>
                <div className="mt-2 grid gap-2">
                  {models.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setModel(m.id)}
                      className={`rounded-2xl border p-3.5 text-left transition duration-200 cursor-pointer ${
                        model === m.id
                          ? isDark
                            ? "border-fuchsia-500 bg-fuchsia-950/20"
                            : "border-fuchsia-500 bg-fuchsia-50/50"
                          : isDark
                            ? "border-white/5 bg-slate-950/30 hover:border-white/15"
                            : "border-slate-200 bg-slate-50 hover:border-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <span className={`block text-xs font-black ${isDark ? "text-white" : "text-slate-900"}`}>{m.label}</span>
                        <span
                          className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                            isDark
                              ? "bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20"
                              : "bg-fuchsia-100 text-fuchsia-750"
                          }`}
                        >
                          {m.id}
                        </span>
                      </div>
                      <span className={`mt-1 block text-[10px] ${isDark ? "text-slate-400" : "text-slate-500"}`}>{m.note}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className={`mt-2 h-28 w-full resize-none rounded-2xl border p-3.5 text-sm leading-6 outline-none transition ${
                    isDark
                      ? "border-slate-800 bg-slate-950/60 text-white focus:border-fuchsia-500"
                      : "border-slate-200 bg-slate-50 text-slate-800 focus:border-fuchsia-500"
                  }`}
                  placeholder="Describe what you want to render..."
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  {examples.map((ex) => (
                    <button
                      key={ex}
                      type="button"
                      onClick={() => setPrompt(ex)}
                      className={`rounded-xl border px-3 py-1 text-[11px] font-bold transition ${
                        isDark
                          ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                          : "border-slate-200 bg-white text-slate-750 hover:bg-slate-50"
                      }`}
                    >
                      Use example
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Images / request</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={count}
                    onChange={(e) => setCount(Math.max(1, Math.min(10, Number(e.target.value) || 1)))}
                    className={`mt-2 w-full rounded-2xl border p-3.5 text-sm outline-none transition ${
                      isDark
                        ? "border-slate-800 bg-slate-950/60 text-white focus:border-fuchsia-500"
                        : "border-slate-200 bg-slate-50 text-slate-800 focus:border-fuchsia-500"
                    }`}
                  />
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Steps</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={numSteps}
                    onChange={(e) => setNumSteps(Math.max(1, Math.min(50, Number(e.target.value) || 4)))}
                    className={`mt-2 w-full rounded-2xl border p-3.5 text-sm outline-none transition ${
                      isDark
                        ? "border-slate-800 bg-slate-950/60 text-white focus:border-fuchsia-500"
                        : "border-slate-200 bg-slate-50 text-slate-800 focus:border-fuchsia-500"
                    }`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Ratio</label>
                  <select
                    value={ratioValue}
                    onChange={(e) => setRatioValue(e.target.value)}
                    className={`mt-2 w-full rounded-2xl border p-3.5 text-sm outline-none transition ${
                      isDark
                        ? "border-slate-800 bg-slate-950/60 text-white focus:border-fuchsia-500"
                        : "border-slate-200 bg-slate-50 text-slate-800 focus:border-fuchsia-500"
                    }`}
                  >
                    {ratios.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label} ({r.value})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Seed (optional)</label>
                  <input
                    type="number"
                    value={seed ?? ""}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (!v) return setSeed(null);
                      const n = Number(v);
                      setSeed(Number.isFinite(n) ? n : null);
                    }}
                    placeholder="Auto"
                    className={`mt-2 w-full rounded-2xl border p-3.5 text-sm outline-none transition ${
                      isDark
                        ? "border-slate-800 bg-slate-950/60 text-white focus:border-fuchsia-500"
                        : "border-slate-200 bg-slate-50 text-slate-800 focus:border-fuchsia-500"
                    }`}
                  />
                </div>
              </div>

              {isInpainting && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">
                      Mask image (required)
                    </label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => onPickMaskFile(e.target.files?.[0] ?? null)}
                      className={`mt-2 w-full rounded-2xl border p-3.5 text-sm outline-none transition ${
                        isDark
                          ? "border-slate-800 bg-slate-950/60 text-white focus:border-fuchsia-500"
                          : "border-slate-200 bg-slate-50 text-slate-800 focus:border-fuchsia-500"
                      }`}
                    />
                    {maskDataUrl && (
                      <div className="mt-3 rounded-2xl border overflow-hidden">
                        <img src={maskDataUrl} alt="Mask preview" className="w-full h-auto object-contain" />
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">Inpaint prompt</label>
                    <textarea
                      value={maskPrompt}
                      onChange={(e) => setMaskPrompt(e.target.value)}
                      className={`mt-2 h-24 w-full resize-none rounded-2xl border p-3.5 text-sm leading-6 outline-none transition ${
                        isDark
                          ? "border-slate-800 bg-slate-950/60 text-white focus:border-fuchsia-500"
                          : "border-slate-200 bg-slate-50 text-slate-800 focus:border-fuchsia-500"
                      }`}
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={isGenerating}
                className="mt-2 w-full rounded-2xl bg-gradient-to-r from-violet-650 to-fuchsia-600 py-3.5 text-sm font-black uppercase tracking-[0.12em] text-white shadow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGenerating ? "Rendering..." : "Generate"}
              </button>

              {message && (
                <p
                  className={`mt-1 rounded-2xl border p-3 text-xs leading-5 whitespace-pre-wrap ${
                    message.toLowerCase().includes("missing")
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
              )}
            </form>

            <section
              className={`rounded-[28px] border p-5 shadow-sm min-h-[520px] flex flex-col ${
                isDark ? "border-white/10 bg-slate-900/40" : "border-slate-200 bg-white/40"
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <h2 className={`text-lg font-bold ${isDark ? "text-white" : "text-slate-900"}`}>Generated Output</h2>
                <div
                  className={`text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-2xl border ${
                    isDark
                      ? "border-white/10 bg-white/5 text-slate-300"
                      : "border-slate-200 bg-white text-slate-750"
                  }`}
                >
                  {model}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {images.map((src, idx) => (
                  <figure
                    key={`${idx}-${src.slice(0, 24)}`}
                    className={`rounded-2xl border overflow-hidden ${
                      isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                    }`}
                  >
                    <div className="p-2">
                      <img
                        src={src}
                        alt={`Pixazo image ${idx + 1}`}
                        className="w-full h-auto rounded-xl object-contain"
                      />
                    </div>
                    <div className="px-3 pb-3 flex items-center justify-between gap-3">
                      <figcaption
                        className={`text-[11px] font-bold ${
                          isDark ? "text-slate-400" : "text-slate-600"
                        }`}
                      >
                        #{idx + 1}
                      </figcaption>
                      <a
                        href={src}
                        download={dataUrlToFilename(src, `pixazo-${model}-${idx + 1}`)}
                        className={`text-[11px] font-bold rounded-xl border px-3 py-1 transition ${
                          isDark
                            ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10"
                            : "border-slate-200 bg-white text-slate-750 hover:bg-slate-50"
                        }`}
                      >
                        Download
                      </a>
                    </div>
                  </figure>
                ))}

                {!isGenerating && images.length === 0 && (
                  <div
                    className={`sm:col-span-2 flex-1 flex flex-col items-center justify-center rounded-2xl border border-dashed min-h-[420px] ${
                      isDark ? "border-white/10 bg-slate-950/20" : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <div className="text-center p-6 text-slate-400">
                      <span className="text-4xl block mb-2">🧪</span>
                      <p className="text-sm font-bold text-slate-500">Pixazo beta canvas</p>
                      <p className="text-xs mt-1">Scroll + generate to test free endpoints</p>
                    </div>
                  </div>
                )}

                {isGenerating && (
                  <div
                    className={`sm:col-span-2 flex items-center justify-center rounded-2xl border border-dashed min-h-[420px] ${
                      isDark ? "border-white/10 bg-slate-950/20" : "border-slate-200 bg-slate-50/50"
                    }`}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="h-10 w-10 rounded-full border-slate-200 border-4 border-t-fuchsia-500 animate-spin" />
                      <p className="text-xs font-black text-fuchsia-400 uppercase tracking-widest animate-pulse">Rendering</p>
                    </div>
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


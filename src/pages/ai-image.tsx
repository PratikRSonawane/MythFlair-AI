import Head from "next/head";
import Link from "next/link";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { FormEvent, useEffect, useMemo, useState } from "react";

const POLLINATIONS_KEY_STORAGE = "mythflair.pollinations.apiKey";
const POLLINATIONS_STATE_STORAGE = "mythflair.pollinations.state";

const ratios = [
  { label: "Square", value: "1:1", width: 1024, height: 1024 },
  { label: "Wide", value: "16:9", width: 1344, height: 768 },
  { label: "Portrait", value: "9:16", width: 768, height: 1344 },
  { label: "Classic", value: "4:3", width: 1152, height: 864 },
];

const models = [
  { id: "zimage", label: "Z-Image Turbo", note: "Low pollen turbo" },
  { id: "flux", label: "Flux Schnell", note: "Low pollen fast" },
];

const styles = [
  {
    id: "cinematic",
    label: "Cinematic",
    promptAdd: "cinematic lighting, dramatic composition, high detail",
  },
  {
    id: "editorial",
    label: "Editorial",
    promptAdd: "editorial photography, clean composition, refined color",
  },
  {
    id: "anime",
    label: "Anime",
    promptAdd: "anime art style, expressive character design, vibrant color",
  },
  {
    id: "fantasy",
    label: "Fantasy",
    promptAdd: "fantasy art, magical atmosphere, intricate environment",
  },
  {
    id: "product",
    label: "Product",
    promptAdd: "premium product render, studio lighting, sharp focus",
  },
  { id: "none", label: "None", promptAdd: "" },
];

function getMaskedKey(key: string) {
  if (key.length < 14) {
    return "Connected key";
  }

  return `${key.slice(0, 5)}...${key.slice(-6)}`;
}

function buildPrompt(prompt: string, styleId: string) {
  const selectedStyle = styles.find((style) => style.id === styleId);
  if (!selectedStyle || !selectedStyle.promptAdd) {
    return prompt.trim();
  }

  return `${prompt.trim()}, ${selectedStyle.promptAdd}`;
}

type Props = InferGetStaticPropsType<typeof getStaticProps>;

export default function AiImagePage({ appKey }: Props) {
  const [prompt, setPrompt] = useState(
    "A mythic glass library floating above a quiet green city at sunrise"
  );
  const [ratioValue, setRatioValue] = useState(ratios[0].value);
  const [model, setModel] = useState(models[0].id);
  const [style, setStyle] = useState(styles[0].id);
  const [apiKey, setApiKey] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [generatedImage, setGeneratedImage] = useState("");
  const [imageSeed, setImageSeed] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [message, setMessage] = useState("");

  const selectedRatio = useMemo(
    () => ratios.find((ratio) => ratio.value === ratioValue) ?? ratios[0],
    [ratioValue]
  );

  const generatedPrompt = useMemo(
    () => buildPrompt(prompt, style),
    [prompt, style]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedKey = window.localStorage.getItem(POLLINATIONS_KEY_STORAGE);
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowKeyModal(true);
    }

    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const returnedKey =
      fragment.get("api_key") ?? fragment.get("access_token") ?? "";
    const returnedState = fragment.get("state") ?? "";
    const returnedError = fragment.get("error") ?? "";

    if (returnedError) {
      setMessage("Pollinations connection was cancelled.");
      setShowKeyModal(true);
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    if (returnedKey) {
      const expectedState =
        window.localStorage.getItem(POLLINATIONS_STATE_STORAGE) ?? "";

      if (expectedState && returnedState && expectedState !== returnedState) {
        setMessage("Pollinations returned an invalid connection state.");
        setShowKeyModal(true);
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      window.localStorage.setItem(POLLINATIONS_KEY_STORAGE, returnedKey);
      window.localStorage.removeItem(POLLINATIONS_STATE_STORAGE);
      setApiKey(returnedKey);
      setManualKey("");
      setShowKeyModal(false);
      setMessage("Pollinations connected.");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const connectWithPollinations = () => {
    if (typeof window === "undefined") {
      return;
    }

    const state =
      window.crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2, 14);

    window.localStorage.setItem(POLLINATIONS_STATE_STORAGE, state);

    const params = new URLSearchParams({
      redirect_uri: `${window.location.origin}${window.location.pathname}`,
      state,
      scope: "generate",
      models: "zimage,flux",
      budget: "5",
      expiry: "7",
    });

    if (appKey) {
      params.set("client_id", appKey);
    }

    window.location.href = `https://enter.pollinations.ai/authorize?${params.toString()}`;
  };

  const saveManualKey = () => {
    const trimmedKey = manualKey.trim();
    if (!trimmedKey.startsWith("sk_")) {
      setMessage("Paste a Pollinations key that starts with sk_.");
      return;
    }

    window.localStorage.setItem(POLLINATIONS_KEY_STORAGE, trimmedKey);
    setApiKey(trimmedKey);
    setManualKey("");
    setShowKeyModal(false);
    setMessage("Pollinations key saved in this browser.");
  };

  const clearApiKey = () => {
    window.localStorage.removeItem(POLLINATIONS_KEY_STORAGE);
    setApiKey("");
    setGeneratedImage("");
    setShowKeyModal(true);
    setMessage("Pollinations key removed from this browser.");
  };

  const generateImage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!prompt.trim()) {
      setMessage("Add a prompt before generating.");
      return;
    }

    if (!apiKey) {
      setMessage("Connect Pollinations before generating.");
      setShowKeyModal(true);
      return;
    }

    const seed = Math.floor(Math.random() * 1000000);
    const params = new URLSearchParams({
      width: String(selectedRatio.width),
      height: String(selectedRatio.height),
      model,
      seed: String(seed),
      nologo: "true",
      private: "true",
    });

    const url = `https://gen.pollinations.ai/image/${encodeURIComponent(
      generatedPrompt
    )}?${params.toString()}`;

    setIsGenerating(true);
    setMessage("");
    setGeneratedImage("");
    setImageSeed(seed);

    try {
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Image generation failed.");
      }

      const blob = await response.blob();
      setGeneratedImage(URL.createObjectURL(blob));
      setMessage("Image generated.");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Pollinations could not generate the image.";
      setMessage(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadImage = async () => {
    if (!generatedImage) {
      return;
    }

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
  };

  return (
    <>
      <Head>
        <title>Pollinations Image Studio - MythFlair AI</title>
        <meta
          name="description"
          content="Generate AI images in MythFlair with a connected Pollinations BYOP key."
        />
      </Head>

      <main className="min-h-screen bg-[#101713] text-[#f5f1e8]">
        <header className="border-b border-white/10 bg-[#101713]/90 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Link href="/" className="flex items-center gap-3">
              <img
                src="/mythflair-logo.png"
                alt="MythFlair"
                className="h-10 w-10 rounded-md object-cover"
              />
              <div>
                <p className="font-black leading-none">MythFlair AI</p>
                <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#91d9c1]">
                  Pollinations Studio
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {apiKey ? (
                <button
                  type="button"
                  onClick={() => setShowKeyModal(true)}
                  className="rounded-md border border-[#91d9c1]/30 bg-[#15342d] px-3 py-2 text-xs font-black text-[#c8f5e6] transition hover:bg-[#1d493f]"
                >
                  {getMaskedKey(apiKey)}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowKeyModal(true)}
                  className="rounded-md bg-[#91d9c1] px-3 py-2 text-xs font-black text-[#101713] transition hover:bg-[#b9f6de]"
                >
                  Connect key
                </button>
              )}
            </div>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl gap-6 px-5 py-6 sm:px-8 lg:grid-cols-[390px_1fr] lg:py-10">
          <form
            onSubmit={generateImage}
            className="rounded-md border border-white/10 bg-white/[0.04] p-4 shadow-2xl shadow-black/20 sm:p-5"
          >
            <div className="mb-5">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#91d9c1]">
                Image generation
              </p>
              <h1 className="mt-2 text-3xl font-black leading-tight tracking-normal">
                Create with Pollinations
              </h1>
              <p className="mt-3 text-sm leading-6 text-[#b9c8bf]">
                Connect your Pollinations key once, then generate images from
                prompts directly in MythFlair.
              </p>
            </div>

            <label className="text-xs font-black uppercase tracking-[0.14em] text-[#b9c8bf]">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="mt-2 h-36 w-full resize-none rounded-md border border-white/10 bg-[#0b100d] p-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/35 focus:border-[#91d9c1]"
              placeholder="Describe the image you want to create"
            />

            <div className="mt-5">
              <label className="text-xs font-black uppercase tracking-[0.14em] text-[#b9c8bf]">
                Model
              </label>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {models.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setModel(item.id)}
                    className={`rounded-md border p-3 text-left transition ${
                      model === item.id
                        ? "border-[#91d9c1] bg-[#14342c]"
                        : "border-white/10 bg-[#0b100d] hover:border-white/30"
                    }`}
                  >
                    <span className="block text-sm font-black">
                      {item.label}
                    </span>
                    <span className="mt-1 block text-xs text-[#9eadA4]">
                      {item.note}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-[#b9c8bf]">
                  Ratio
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {ratios.map((ratio) => (
                    <button
                      key={ratio.value}
                      type="button"
                      onClick={() => setRatioValue(ratio.value)}
                      className={`rounded-md border px-3 py-2 text-left text-sm font-bold transition ${
                        ratioValue === ratio.value
                          ? "border-[#d0a44c] bg-[#3a2e14] text-[#ffe7a8]"
                          : "border-white/10 bg-[#0b100d] text-[#d7ddd8] hover:border-white/30"
                      }`}
                    >
                      {ratio.label}
                      <span className="block text-xs font-medium opacity-70">
                        {ratio.value}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-black uppercase tracking-[0.14em] text-[#b9c8bf]">
                  Style
                </label>
                <select
                  value={style}
                  onChange={(event) => setStyle(event.target.value)}
                  className="mt-2 w-full rounded-md border border-white/10 bg-[#0b100d] px-3 py-3 text-sm font-bold text-white outline-none focus:border-[#91d9c1]"
                >
                  {styles.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={isGenerating}
              className="mt-6 w-full rounded-md bg-[#91d9c1] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-[#101713] transition hover:bg-[#b9f6de] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generating..." : "Generate image"}
            </button>

            {message && (
              <p className="mt-4 rounded-md border border-white/10 bg-white/[0.04] p-3 text-sm leading-6 text-[#d9e5de]">
                {message}
              </p>
            )}
          </form>

          <section className="rounded-md border border-white/10 bg-[#0b100d] p-4 sm:p-5">
            <div className="mb-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#d0a44c]">
                  Output
                </p>
                <h2 className="mt-1 text-2xl font-black">Generated image</h2>
              </div>
              {generatedImage && (
                <button
                  type="button"
                  onClick={downloadImage}
                  className="rounded-md border border-white/15 px-4 py-2 text-sm font-black transition hover:bg-white hover:text-[#101713]"
                >
                  Download
                </button>
              )}
            </div>

            <div className="relative flex min-h-[520px] items-center justify-center overflow-hidden rounded-md border border-white/10 bg-[linear-gradient(135deg,#111713,#18362f_55%,#261f12)]">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(145,217,193,0.18),transparent_28%),radial-gradient(circle_at_80%_10%,rgba(208,164,76,0.2),transparent_30%)]" />

              {isGenerating && (
                <div className="relative z-10 flex flex-col items-center gap-4 text-center">
                  <div className="h-14 w-14 rounded-full border-4 border-white/20 border-t-[#91d9c1] animate-spin" />
                  <p className="text-sm font-black uppercase tracking-[0.16em] text-[#c8f5e6]">
                    Rendering
                  </p>
                </div>
              )}

              {!isGenerating && generatedImage && (
                <img
                  src={generatedImage}
                  alt="Generated artwork"
                  className="relative z-10 max-h-[76vh] w-auto max-w-full rounded-sm object-contain shadow-2xl"
                />
              )}

              {!isGenerating && !generatedImage && (
                <div className="relative z-10 max-w-md px-6 text-center">
                  <div className="mx-auto mb-5 flex h-24 w-24 items-center justify-center rounded-md border border-[#91d9c1]/30 bg-[#13231f] text-2xl font-black text-[#91d9c1]">
                    IMG
                  </div>
                  <p className="text-xl font-black">Your render appears here</p>
                  <p className="mt-3 text-sm leading-6 text-[#b9c8bf]">
                    Use a connected Pollinations key, choose a model and ratio,
                    then generate your first image.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-4 rounded-md border border-white/10 bg-white/[0.04] p-3">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-[#91d9c1]">
                Prompt preview
              </p>
              <p className="mt-2 text-sm leading-6 text-[#d9e5de]">
                {generatedPrompt}
              </p>
            </div>
          </section>
        </section>

        {showKeyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-md border border-white/10 bg-[#f4f1ea] p-5 text-[#101713] shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">
                    Pollinations BYOP
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    Connect your API key
                  </h2>
                </div>
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => setShowKeyModal(false)}
                    className="rounded-md border border-black/15 px-3 py-2 text-xs font-black"
                  >
                    Close
                  </button>
                )}
              </div>

              <p className="mt-4 text-sm leading-6 text-[#536058]">
                Pollinations now uses Bring Your Own Pollen. You can authorize
                MythFlair through Pollinations or paste a temporary `sk_...` key
                from your account. The key is stored only in this browser.
              </p>

              <button
                type="button"
                onClick={connectWithPollinations}
                className="mt-5 w-full rounded-md bg-[#101713] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#0f766e]"
              >
                Authorize with Pollinations
              </button>

              <div className="my-5 flex items-center gap-3 text-xs font-black uppercase tracking-[0.14em] text-[#6c766f]">
                <span className="h-px flex-1 bg-black/10" />
                Or paste key
                <span className="h-px flex-1 bg-black/10" />
              </div>

              <input
                type="password"
                value={manualKey}
                onChange={(event) => setManualKey(event.target.value)}
                placeholder="sk_..."
                className="w-full rounded-md border border-black/15 bg-white px-3 py-3 text-sm outline-none focus:border-[#0f766e]"
              />
              <button
                type="button"
                onClick={saveManualKey}
                className="mt-3 w-full rounded-md border border-black/15 bg-white px-5 py-3 text-sm font-black uppercase tracking-[0.12em] transition hover:bg-[#e7eee9]"
              >
                Save key locally
              </button>

              {apiKey && (
                <button
                  type="button"
                  onClick={clearApiKey}
                  className="mt-3 w-full rounded-md border border-red-900/20 bg-red-50 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-red-800 transition hover:bg-red-100"
                >
                  Remove saved key
                </button>
              )}

              {!appKey && (
                <p className="mt-4 text-xs leading-5 text-[#6c766f]">
                  Add `pollination_key=pk_...` in `.env.local` and Vercel when
                  you create a Pollinations App Key. The connection still works
                  without it, but Pollinations will show the site hostname
                  instead of your app name.
                </p>
              )}
            </div>
          </div>
        )}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps<{
  appKey: string;
}> = async () => {
  const { getPollinationsAppKey } = await import("@/lib/pollinationsConfig");

  return {
    props: {
      appKey: getPollinationsAppKey(),
    },
  };
};

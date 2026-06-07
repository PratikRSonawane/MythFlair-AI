import Head from "next/head";
import Link from "next/link";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { FormEvent, useEffect, useMemo, useState } from "react";

const POLLINATIONS_KEY_STORAGE = "mythflair.pollinations.apiKey";
const POLLINATIONS_STATE_STORAGE = "mythflair.pollinations.state";

const textModels = [
  {
    id: "nova-fast",
    label: "Nova Micro",
    note: "Lowest pollen general text",
  },
  {
    id: "mistral",
    label: "Mistral Small 3.2",
    note: "Balanced writing and reasoning",
  },
  {
    id: "llama-scout",
    label: "Meta Llama 4 Scout",
    note: "Fast creative answers",
  },
];

const codingModels = [
  {
    id: "qwen-coder",
    label: "Qwen3 Coder 30B",
    note: "Coding-focused low-pollen model",
  },
];

type Mode = "text" | "coding";
type Props = InferGetStaticPropsType<typeof getStaticProps>;

function maskKey(key: string) {
  if (key.length < 14) {
    return "Connected";
  }

  return `${key.slice(0, 5)}...${key.slice(-6)}`;
}

export default function PollinationsTextPage({ appKey }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [showConnect, setShowConnect] = useState(false);
  const [mode, setMode] = useState<Mode>("text");
  const [selectedModel, setSelectedModel] = useState(textModels[0].id);
  const [prompt, setPrompt] = useState(
    "Write a short launch announcement for MythFlair AI's free provider tools."
  );
  const [result, setResult] = useState("");
  const [message, setMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const activeModels = useMemo(
    () => (mode === "coding" ? codingModels : textModels),
    [mode]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const storedKey = window.localStorage.getItem(POLLINATIONS_KEY_STORAGE);
    if (storedKey) {
      setApiKey(storedKey);
    } else {
      setShowConnect(true);
    }

    const fragment = new URLSearchParams(window.location.hash.slice(1));
    const returnedKey =
      fragment.get("api_key") ?? fragment.get("access_token") ?? "";
    const returnedState = fragment.get("state") ?? "";
    const returnedError = fragment.get("error") ?? "";

    if (returnedError) {
      setMessage("Pollinations connection was cancelled.");
      setShowConnect(true);
      window.history.replaceState(null, "", window.location.pathname);
      return;
    }

    if (returnedKey) {
      const expectedState =
        window.localStorage.getItem(POLLINATIONS_STATE_STORAGE) ?? "";

      if (expectedState && returnedState && expectedState !== returnedState) {
        setMessage("Pollinations returned an invalid connection state.");
        setShowConnect(true);
        window.history.replaceState(null, "", window.location.pathname);
        return;
      }

      window.localStorage.setItem(POLLINATIONS_KEY_STORAGE, returnedKey);
      window.localStorage.removeItem(POLLINATIONS_STATE_STORAGE);
      setApiKey(returnedKey);
      setManualKey("");
      setShowConnect(false);
      setMessage("Pollinations connected.");
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  const authorizePollinations = () => {
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
      models: "nova-fast,mistral,llama-scout,qwen-coder",
      budget: "5",
      expiry: "7",
    });

    if (appKey) {
      params.set("client_id", appKey);
    }

    window.location.href = `https://enter.pollinations.ai/authorize?${params.toString()}`;
  };

  const saveManualKey = () => {
    const key = manualKey.trim();
    if (!key.startsWith("sk_")) {
      setMessage("Paste a Pollinations key that starts with sk_.");
      return;
    }

    window.localStorage.setItem(POLLINATIONS_KEY_STORAGE, key);
    setApiKey(key);
    setManualKey("");
    setShowConnect(false);
    setMessage("Pollinations key saved in this browser.");
  };

  const clearKey = () => {
    window.localStorage.removeItem(POLLINATIONS_KEY_STORAGE);
    setApiKey("");
    setResult("");
    setShowConnect(true);
    setMessage("Pollinations key removed from this browser.");
  };

  const changeMode = (nextMode: Mode) => {
    setMode(nextMode);
    setSelectedModel(
      nextMode === "coding" ? codingModels[0].id : textModels[0].id
    );
    setResult("");
  };

  const generateText = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!prompt.trim()) {
      setMessage("Add a prompt before generating.");
      return;
    }

    if (!apiKey) {
      setMessage("Connect Pollinations before generating text.");
      setShowConnect(true);
      return;
    }

    setIsGenerating(true);
    setMessage("");
    setResult("");

    try {
      const response = await fetch(
        "https://gen.pollinations.ai/v1/chat/completions",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: selectedModel,
            messages: [
              {
                role: "system",
                content:
                  mode === "coding"
                    ? "You are a concise coding assistant. Return practical code and short explanations."
                    : "You are a concise creative writing assistant for MythFlair AI users.",
              },
              {
                role: "user",
                content: prompt.trim(),
              },
            ],
          }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Text generation failed.");
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;
      setResult(
        typeof content === "string"
          ? content
          : JSON.stringify(data, null, 2)
      );
      setMessage("Text generated.");
    } catch (error) {
      setMessage(
        error instanceof Error
          ? error.message
          : "Pollinations could not generate text."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <>
      <Head>
        <title>Pollinations Text Generator - MythFlair</title>
        <meta
          name="description"
          content="Generate text and code with low-pollen Pollinations models in MythFlair."
        />
      </Head>

      <main className="min-h-screen bg-[#f7f4ed] text-[#111713]">
        <header className="border-b border-black/10 bg-white/70 backdrop-blur">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8">
            <Link href="/pollinations-ai" className="flex items-center gap-3">
              <img
                src="/mythflair-logo.png"
                alt="MythFlair"
                className="h-10 w-10 rounded-md object-cover"
              />
              <div>
                <p className="font-black leading-none">Pollinations Text</p>
                <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#2563eb]">
                  Low pollen models
                </p>
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setShowConnect(true)}
              className="rounded-md bg-[#111713] px-4 py-2 text-sm font-black text-white transition hover:bg-[#2563eb]"
            >
              {apiKey ? maskKey(apiKey) : "Connect"}
            </button>
          </div>
        </header>

        <section className="mx-auto grid max-w-7xl gap-6 px-5 py-8 sm:px-8 lg:grid-cols-[390px_1fr]">
          <form
            onSubmit={generateText}
            className="rounded-md border border-black/10 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2563eb]">
              Text generation
            </p>
            <h1 className="mt-2 text-3xl font-black leading-tight">
              Choose a low-pollen model
            </h1>
            <p className="mt-3 text-sm leading-6 text-[#5a665e]">
              Nova Micro stays first for general text. Coding mode only uses
              Qwen3 Coder 30B.
            </p>

            <div className="mt-6 grid grid-cols-2 gap-2 rounded-md bg-[#f0ece2] p-1">
              <button
                type="button"
                onClick={() => changeMode("text")}
                className={`rounded px-3 py-2 text-sm font-black ${
                  mode === "text" ? "bg-white shadow-sm" : "text-[#5a665e]"
                }`}
              >
                Text
              </button>
              <button
                type="button"
                onClick={() => changeMode("coding")}
                className={`rounded px-3 py-2 text-sm font-black ${
                  mode === "coding" ? "bg-white shadow-sm" : "text-[#5a665e]"
                }`}
              >
                Coding
              </button>
            </div>

            <div className="mt-5 grid gap-2">
              {activeModels.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelectedModel(item.id)}
                  className={`rounded-md border p-3 text-left transition ${
                    selectedModel === item.id
                      ? "border-[#2563eb] bg-[#eef4ff]"
                      : "border-black/10 bg-white hover:border-black/25"
                  }`}
                >
                  <span className="block text-sm font-black">
                    {item.label}
                  </span>
                  <span className="mt-1 block text-xs text-[#5a665e]">
                    {item.id} - {item.note}
                  </span>
                </button>
              ))}
            </div>

            <label className="mt-6 block text-xs font-black uppercase tracking-[0.14em] text-[#5a665e]">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(event) => setPrompt(event.target.value)}
              className="mt-2 h-40 w-full resize-none rounded-md border border-black/10 bg-[#fbfaf7] p-3 text-sm leading-6 outline-none focus:border-[#2563eb]"
            />

            <button
              type="submit"
              disabled={isGenerating}
              className="mt-5 w-full rounded-md bg-[#111713] px-5 py-4 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#2563eb] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isGenerating ? "Generating..." : "Generate text"}
            </button>

            {message && (
              <p className="mt-4 rounded-md border border-black/10 bg-[#f7f4ed] p-3 text-sm leading-6 text-[#4f5b52]">
                {message}
              </p>
            )}
          </form>

          <section className="rounded-md border border-black/10 bg-[#111713] p-5 text-white">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#93c5fd]">
                  Output
                </p>
                <h2 className="mt-1 text-2xl font-black">Generated response</h2>
              </div>
              <span className="rounded-md border border-white/10 px-3 py-2 text-xs font-black text-white/80">
                {selectedModel}
              </span>
            </div>

            <div className="min-h-[560px] rounded-md border border-white/10 bg-white/[0.04] p-4">
              {isGenerating ? (
                <div className="flex min-h-[520px] items-center justify-center">
                  <div className="h-12 w-12 rounded-full border-4 border-white/20 border-t-[#93c5fd] animate-spin" />
                </div>
              ) : result ? (
                <pre className="whitespace-pre-wrap break-words text-sm leading-7 text-[#ecf4ff]">
                  {result}
                </pre>
              ) : (
                <div className="flex min-h-[520px] items-center justify-center text-center">
                  <div className="max-w-sm">
                    <p className="text-3xl font-black">TXT</p>
                    <p className="mt-3 text-sm leading-6 text-white/70">
                      Connect Pollinations, pick a model, and generate text or
                      code here.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </section>

        {showConnect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-md border border-black/10 bg-[#f7f4ed] p-5 text-[#111713] shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#2563eb]">
                    Pollinations connection
                  </p>
                  <h2 className="mt-2 text-2xl font-black">
                    Connect your API key
                  </h2>
                </div>
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => setShowConnect(false)}
                    className="rounded-md border border-black/15 px-3 py-2 text-xs font-black"
                  >
                    Close
                  </button>
                )}
              </div>

              <p className="mt-4 text-sm leading-6 text-[#536058]">
                Authorize MythFlair through Pollinations or paste a temporary
                `sk_...` key. It is stored locally in this browser.
              </p>

              <button
                type="button"
                onClick={authorizePollinations}
                className="mt-5 w-full rounded-md bg-[#111713] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#2563eb]"
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
                className="w-full rounded-md border border-black/15 bg-white px-3 py-3 text-sm outline-none focus:border-[#2563eb]"
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
                  onClick={clearKey}
                  className="mt-3 w-full rounded-md border border-red-900/20 bg-red-50 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-red-800 transition hover:bg-red-100"
                >
                  Remove saved key
                </button>
              )}

              {!appKey && (
                <p className="mt-4 text-xs leading-5 text-[#6c766f]">
                  Add `pollination_key=pk_...` in `.env.local` and Vercel after
                  creating a Pollinations App Key. Secret `sk_...` keys are not
                  exposed as app keys.
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

import Head from "next/head";
import Link from "next/link";
import type { GetStaticProps, InferGetStaticPropsType } from "next";
import { useEffect, useState } from "react";

import PollinationsAccountPanel from "@/components/PollinationsAccountPanel";

const POLLINATIONS_KEY_STORAGE = "mythflair.pollinations.apiKey";
const POLLINATIONS_STATE_STORAGE = "mythflair.pollinations.state";

type PollinationsTool = {
  title: string;
  label: string;
  description: string;
  href?: string;
  panel: string;
  accent: string;
};

const tools: PollinationsTool[] = [
  {
    title: "Chat",
    label: "Live text tool",
    description: "Generate text with low-pollen Pollinations chat models.",
    href: "/pollinations-text",
    panel: "CHAT",
    accent: "#2563eb",
  },
  {
    title: "Image",
    label: "Live tool",
    description: "Generate images from prompts with your connected BYOP key.",
    href: "/ai-image",
    panel: "IMG",
    accent: "#0f766e",
  },
  {
    title: "Video",
    label: "Coming soon",
    description: "A future space for prompt-to-video generation.",
    panel: "VID",
    accent: "#9a3412",
  },
  {
    title: "TTS",
    label: "Coming soon",
    description: "A future text-to-speech workspace for voice generation.",
    panel: "TTS",
    accent: "#be123c",
  },
  {
    title: "Embedding",
    label: "Coming soon",
    description: "A future embedding tool for semantic search and retrieval.",
    panel: "EMB",
    accent: "#6d28d9",
  },
];

const pollinationsModels = [
  "zimage",
  "flux",
  "kontext",
  "nanobanana",
  "nanobanana-2",
  "nanobanana-pro",
  "seedream5",
  "seedream",
  "seedream-pro",
  "gptimage",
  "gptimage-large",
  "gpt-image-2",
  "wan-image",
  "wan-image-pro",
  "qwen-image",
  "grok-imagine",
  "grok-imagine-pro",
  "klein",
  "p-image",
  "p-image-edit",
  "nova-canvas",
  "nova-fast",
  "mistral",
  "llama-scout",
  "qwen-coder",
];

type Props = InferGetStaticPropsType<typeof getStaticProps>;

function maskKey(key: string) {
  if (key.length < 14) {
    return "Connected";
  }

  return `${key.slice(0, 5)}...${key.slice(-6)}`;
}

export default function PollinationsAiPage({ appKey }: Props) {
  const [apiKey, setApiKey] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [showConnect, setShowConnect] = useState(false);
  const [message, setMessage] = useState("");

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
      setMessage("Pollinations connected. Choose a tool to continue.");
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
      scope: "generate usage",
      models: pollinationsModels.join(","),
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
    setShowConnect(true);
    setMessage("Pollinations key removed from this browser.");
  };

  return (
    <>
      <Head>
        <title>Pollinations AI Provider - MythFlair</title>
        <meta
          name="description"
          content="Connect Pollinations AI and choose chat, image, video, TTS, or embedding tools."
        />
      </Head>

      <main className="min-h-screen bg-[#f7f4ed] text-[#111713]">
        <section className="border-b border-black/10 bg-[#10201b] text-white">
          <div className="mx-auto max-w-7xl px-5 py-5 sm:px-8">
            <header className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <img
                  src="/mythflair-logo.png"
                  alt="MythFlair"
                  className="h-11 w-11 rounded-md object-cover"
                />
                <div>
                  <p className="font-black leading-none">MythFlair AI</p>
                  <p className="mt-1 text-xs font-black uppercase tracking-[0.16em] text-[#91d9c1]">
                    Free Provider
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => setShowConnect(true)}
                className="rounded-md bg-[#91d9c1] px-4 py-2 text-sm font-black text-[#10201b] transition hover:bg-[#b9f6de]"
              >
                {apiKey ? maskKey(apiKey) : "Connect"}
              </button>
            </header>

            <div className="grid gap-8 py-12 lg:grid-cols-[1fr_0.8fr] lg:items-end">
              <div className="max-w-3xl">
                <p className="mb-5 inline-flex rounded-md border border-[#91d9c1]/30 bg-white/10 px-3 py-1 text-sm font-black text-[#c8f5e6]">
                  Pollinations AI
                </p>
                <h1 className="text-5xl font-black leading-[0.96] tracking-normal sm:text-6xl">
                  Connect once, then choose your tool.
                </h1>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[#c8d8d0]">
                  Pollinations uses Bring Your Own Pollen. After connection,
                  your key stays in this browser and the image tool can use it
                  immediately.
                </p>
              </div>

              <div className="rounded-md border border-white/10 bg-white/10 p-5">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-[#91d9c1]">
                  Connection
                </p>
                <p className="mt-3 text-2xl font-black">
                  {apiKey ? "Ready to use" : "Key required"}
                </p>
                <p className="mt-3 text-sm leading-6 text-[#c8d8d0]">
                  {apiKey
                    ? "Open any Pollinations tool from this page."
                    : "Authorize with Pollinations or paste an sk_ key."}
                </p>
                {message && (
                  <p className="mt-4 rounded-md border border-white/10 bg-black/15 p-3 text-sm text-[#e5f7ef]">
                    {message}
                  </p>
                )}
              </div>
            </div>

            {apiKey && (
              <div className="pb-8">
                <PollinationsAccountPanel apiKey={apiKey} compact />
              </div>
            )}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0f766e]">
              Provider tools
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              What do you want to create?
            </h2>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            {tools.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href ?? "#"}
                aria-disabled={!tool.href}
                onClick={(event) => {
                  if (!tool.href) {
                    event.preventDefault();
                  }
                }}
                className={!tool.href ? "cursor-default" : ""}
              >
                <article
                  className={`flex min-h-[250px] flex-col rounded-md border border-black/10 bg-white p-5 shadow-sm transition ${
                    tool.href
                      ? "hover:-translate-y-1 hover:shadow-xl"
                      : "opacity-70"
                  }`}
                >
                  <div
                    className="mb-7 flex h-24 items-end justify-between rounded bg-[#f3f0e8] p-4"
                    style={{ color: tool.accent }}
                  >
                    <span className="text-3xl font-black">{tool.panel}</span>
                    <span className="h-11 w-11 rounded-sm border-2 border-current" />
                  </div>
                  <p
                    className="text-xs font-black uppercase tracking-[0.14em]"
                    style={{ color: tool.accent }}
                  >
                    {tool.label}
                  </p>
                  <h3 className="mt-3 text-2xl font-black">{tool.title}</h3>
                  <p className="mt-3 flex-1 text-sm leading-6 text-[#5a665e]">
                    {tool.description}
                  </p>
                  <p className="mt-6 text-sm font-black uppercase tracking-[0.12em]">
                    {tool.href ? "Open tool" : "Coming soon"}
                  </p>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {showConnect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <div className="w-full max-w-lg rounded-md border border-black/10 bg-[#f7f4ed] p-5 text-[#111713] shadow-2xl">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-[#0f766e]">
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
                className="mt-5 w-full rounded-md bg-[#111713] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:bg-[#0f766e]"
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
                  onClick={clearKey}
                  className="mt-3 w-full rounded-md border border-red-900/20 bg-red-50 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-red-800 transition hover:bg-red-100"
                >
                  Remove saved key
                </button>
              )}

              {!appKey && (
                <p className="mt-4 text-xs leading-5 text-[#6c766f]">
                  Add `pollination_key=pk_...` in `.env.local` and Vercel after
                  creating a Pollinations App Key. The flow still works without
                  it, but attribution uses the hostname.
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

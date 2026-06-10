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
  const [balance, setBalance] = useState<number | undefined>();
  const [isLoadingBalance, setIsLoadingBalance] = useState(false);
  
  // Theme state
  const [isDark, setIsDark] = useState(true);
  // Modal state for balance and spend history
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    // Load theme setting
    const savedTheme = window.localStorage.getItem("mythflair.pollinations.theme");
    if (savedTheme === "light") {
      setIsDark(false);
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

  // Poll balance when API key is present
  useEffect(() => {
    if (!apiKey) {
      setBalance(undefined);
      return;
    }

    let isMounted = true;
    const fetchBalance = async () => {
      setIsLoadingBalance(true);
      try {
        const response = await fetch("https://gen.pollinations.ai/account/balance", {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (isMounted) {
            setBalance(data.balance);
          }
        }
      } catch (err) {
        console.error("Error fetching balance:", err);
      } finally {
        if (isMounted) {
          setIsLoadingBalance(false);
        }
      }
    };

    fetchBalance();
    const interval = setInterval(fetchBalance, 30000); // Poll every 30 seconds

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [apiKey]);

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
    setBalance(undefined);
    setShowConnect(true);
    setMessage("Pollinations key removed from this browser.");
  };

  const getToolIcon = (title: string, accent: string) => {
    switch (title) {
      case "Chat":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 13.8214 2.48697 15.5291 3.33782 17L2 22L7 20.6622C8.47088 21.513 10.1786 22 12 22Z" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="8" cy="12" r="1.5" fill={accent}/>
            <circle cx="12" cy="12" r="1.5" fill={accent}/>
            <circle cx="16" cy="12" r="1.5" fill={accent}/>
          </svg>
        );
      case "Image":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="4" stroke={accent} strokeWidth="2"/>
            <circle cx="9" cy="9" r="2.5" stroke={accent} strokeWidth="2"/>
            <path d="M3 18L9 12L15 18L19 14L21 16" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        );
      case "Video":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="2" y="4" width="20" height="16" rx="4" stroke={accent} strokeWidth="2"/>
            <path d="M6 4V20M18 4V20M2 9H6M18 9H22M2 15H6M18 15H22" stroke={accent} strokeWidth="2"/>
            <path d="M10 9L15 12L10 15V9Z" fill={accent}/>
          </svg>
        );
      case "TTS":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2V22M17 5V19M22 9V15M7 6V18M2 10V14" stroke={accent} strokeWidth="2" strokeLinecap="round"/>
          </svg>
        );
      case "Embedding":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="5" r="2.5" stroke={accent} strokeWidth="2"/>
            <circle cx="5" cy="12" r="2.5" stroke={accent} strokeWidth="2"/>
            <circle cx="19" cy="12" r="2.5" stroke={accent} strokeWidth="2"/>
            <circle cx="12" cy="19" r="2.5" stroke={accent} strokeWidth="2"/>
            <path d="M12 7.5V16.5M7.5 12H16.5M8.5 8.5L15.5 15.5M8.5 15.5L15.5 8.5" stroke={accent} strokeWidth="1.5" strokeDasharray="2 2"/>
          </svg>
        );
      default:
        return null;
    }
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

      <main className={`relative min-h-screen overflow-hidden transition-colors duration-300 font-sans selection:bg-fuchsia-500/30 ${
        isDark ? "bg-[#090b11] text-slate-100 selection:text-fuchsia-250" : "bg-slate-50 text-slate-900 selection:text-fuchsia-900"
      }`}>
        {/* Colorful Glowing background */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className={`absolute top-0 left-0 w-full h-full bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] transition-all ${
            isDark 
              ? "bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)]"
              : "bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)]"
          }`} />
          <div className={`absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full blur-[120px] animate-pulse transition-all ${
            isDark ? "bg-fuchsia-600/15" : "bg-fuchsia-400/10"
          }`} style={{ animationDuration: '8s' }} />
          <div className={`absolute right-[-5%] top-[5%] h-[600px] w-[600px] rounded-full blur-[140px] animate-pulse transition-all ${
            isDark ? "bg-cyan-500/15" : "bg-cyan-400/10"
          }`} style={{ animationDuration: '12s' }} />
          <div className={`absolute bottom-[-10%] left-[20%] h-[500px] w-[500px] rounded-full blur-[130px] animate-pulse transition-all ${
            isDark ? "bg-violet-600/10" : "bg-violet-400/8"
          }`} style={{ animationDuration: '10s' }} />
        </div>

        <section className={`relative border-b transition-colors duration-300 ${isDark ? "border-white/5" : "border-slate-200"}`}>
          <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
            <header className={`flex items-center justify-between gap-4 rounded-3xl border p-4 backdrop-blur-xl transition-all ${
              isDark 
                ? "border-white/10 bg-slate-950/40 shadow-[0_8px_32px_rgba(0,0,0,0.37)]" 
                : "border-slate-200 bg-white/70 shadow-[0_8px_32px_rgba(15,23,42,0.06)]"
            }`}>
              <Link href="/" className="flex items-center gap-3 group">
                <div className={`relative overflow-hidden rounded-2xl border transition-all duration-300 group-hover:scale-105 ${isDark ? "border-white/10" : "border-slate-200"}`}>
                  <div className={`absolute inset-0 bg-gradient-to-tr from-fuchsia-500 to-cyan-500 ${isDark ? "opacity-20" : "opacity-10"}`} />
                  <img
                    src="/mythflair-logo.png"
                    alt="MythFlair"
                    className="h-11 w-11 object-cover relative z-10"
                  />
                </div>
                <div>
                  <p className={`font-black leading-none tracking-wide transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>MythFlair AI</p>
                  <p className="mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.25em] bg-gradient-to-r from-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                    Free Provider
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2.5">
                {apiKey && (
                  <button
                    type="button"
                    onClick={() => setShowBalanceDetails(true)}
                    className={`flex items-center gap-1.5 rounded-2xl border px-3.5 py-2 text-xs sm:text-sm font-black transition-all cursor-pointer ${
                      isDark
                        ? "border-amber-500/25 bg-amber-500/10 text-amber-400 hover:border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        : "border-amber-500/20 bg-amber-500/5 text-amber-700 hover:bg-amber-500/15"
                    }`}
                  >
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                    </span>
                    <span className="mr-0.5">🪙</span>
                    <span>
                      {isLoadingBalance
                        ? "..."
                        : balance !== undefined
                        ? balance.toLocaleString(undefined, { maximumFractionDigits: 2 }) + " Pollen"
                        : "0.00"}
                    </span>
                  </button>
                )}

                {/* Theme toggle switch button */}
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
                      ? "border-white/10 bg-white/5 text-yellow-400 hover:bg-white/10 hover:scale-105"
                      : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:scale-105"
                  }`}
                  aria-label="Toggle Theme"
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

                <button
                  type="button"
                  onClick={() => setShowConnect(true)}
                  className={`rounded-2xl border px-4 py-2 text-xs sm:text-sm font-bold shadow-md transition-all hover:scale-[1.02] cursor-pointer ${
                    isDark
                      ? "border-white/10 bg-slate-900/80 text-slate-200 hover:bg-slate-800 hover:text-white"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {apiKey ? maskKey(apiKey) : "Connect Key"}
                </button>
              </div>
            </header>

            <div className="grid gap-10 py-12 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
              <div className="max-w-3xl space-y-6">
                <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] shadow-sm transition-all ${
                  isDark 
                    ? "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-300 shadow-[0_0_15px_rgba(217,70,239,0.15)]"
                    : "border-fuchsia-200 bg-fuchsia-50 text-fuchsia-700"
                }`}>
                  <span className="h-1.5 w-1.5 rounded-full bg-fuchsia-500 animate-pulse" />
                  Pollinations AI
                </div>
                <h1 className={`text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl transition-colors ${
                  isDark ? "text-white" : "text-slate-900"
                }`}>
                  Build, imagine, and launch in a{" "}
                  <span className="bg-gradient-to-r from-fuchsia-500 via-pink-500 to-cyan-500 bg-clip-text text-transparent">
                    creative cosmos.
                  </span>
                </h1>
                <p className={`text-base leading-8 sm:text-lg transition-colors ${
                  isDark ? "text-slate-400" : "text-slate-600"
                }`}>
                  Connect once to unlock a vivid, high-speed ecosystem of tools for text, image generation, and creative AI workflows. Your BYOP (Bring Your Own Pollen) key is stored locally and securely in your browser.
                </p>

                <div className="flex flex-wrap gap-2.5 pt-2">
                  <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                    isDark ? "border-cyan-500/10 bg-cyan-500/5 text-cyan-300" : "border-cyan-200 bg-cyan-50/60 text-cyan-800"
                  }`}>
                    ⚡ Fast BYOP Setup
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                    isDark ? "border-violet-500/10 bg-violet-500/5 text-violet-300" : "border-violet-200 bg-violet-50/60 text-violet-850"
                  }`}>
                    🎨 Creative Hub
                  </span>
                  <span className={`inline-flex items-center gap-1.5 rounded-2xl border px-4 py-2.5 text-xs font-semibold transition-colors ${
                    isDark ? "border-emerald-500/10 bg-emerald-500/5 text-emerald-300" : "border-emerald-200 bg-emerald-50/60 text-emerald-800"
                  }`}>
                    🔐 Local Key Storage
                  </span>
                </div>
              </div>

              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-[32px] bg-gradient-to-r from-fuchsia-500 to-cyan-550 opacity-20 blur-xl transition duration-500 group-hover:opacity-35" />
                <div className={`relative rounded-[28px] border p-6 backdrop-blur-xl shadow-2xl transition-all ${
                  isDark ? "border-white/10 bg-slate-900/60" : "border-slate-200 bg-white/80"
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                        Connection status
                      </p>
                      <p className={`mt-2 text-2xl font-black transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>
                        {apiKey ? "Ready to create" : "Key required"}
                      </p>
                    </div>
                    <div className="relative flex h-3.5 w-3.5">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${apiKey ? "bg-emerald-400" : "bg-amber-400"}`} />
                      <span className={`relative inline-flex rounded-full h-3.5 w-3.5 ${apiKey ? "bg-emerald-500" : "bg-amber-500"}`} />
                    </div>
                  </div>
                  <p className={`mt-4 text-sm leading-6 transition-colors ${isDark ? "text-slate-400" : "text-slate-660"}`}>
                    {apiKey
                      ? "Choose a Pollinations tool below to begin generating instantly."
                      : "Connect your Pollinations account or paste your secret key (sk_...) below to unlock the workspace."}
                  </p>
                  
                  {message && (
                    <div className={`mt-4 rounded-2xl border p-3.5 text-xs font-medium leading-5 transition-colors ${
                      isDark ? "border-slate-800 bg-slate-950/80 text-slate-300" : "border-slate-200 bg-slate-100 text-slate-700"
                    }`}>
                      {message}
                    </div>
                  )}

                  {!apiKey && (
                    <button
                      type="button"
                      onClick={() => setShowConnect(true)}
                      className="mt-6 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 py-3.5 text-sm font-black uppercase tracking-[0.15em] text-white shadow-lg hover:shadow-fuchsia-500/20 hover:scale-[1.01] transition-all cursor-pointer"
                    >
                      Connect Pollinations
                    </button>
                  )}
                  
                  {apiKey && (
                    <div className={`mt-5 rounded-2xl border p-4 transition-all ${
                      isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-150 bg-slate-50"
                    }`}>
                      <p className={`text-[10px] font-black uppercase tracking-[0.2em] ${isDark ? "text-cyan-400" : "text-cyan-700"}`}>
                        Secure Token Access
                      </p>
                      <div className="mt-3 flex items-center justify-between gap-2">
                        <span className="font-mono text-xs text-slate-400">{maskKey(apiKey)}</span>
                        <button
                          type="button"
                          onClick={clearKey}
                          className="text-xs font-bold text-rose-500 hover:text-rose-400 hover:underline cursor-pointer"
                        >
                          Disconnect
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-fuchsia-500">
              Provider workspace
            </p>
            <h2 className={`mt-2 text-3xl font-black sm:text-4xl transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>
              Choose your creative medium
            </h2>
            <p className={`mt-3 leading-7 transition-colors ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Each portal launches a specialized canvas powered directly by the connected key.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
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
                className={!tool.href ? "cursor-default" : "group"}
              >
                <article
                  className={`group relative flex min-h-[300px] flex-col overflow-hidden rounded-[28px] border transition-all duration-300 ${
                    isDark 
                      ? (tool.href 
                          ? "border-white/10 bg-slate-900/40 hover:-translate-y-2 hover:border-white/20 hover:shadow-[0_20px_50px_-10px_rgba(0,0,0,0.5)]" 
                          : "border-white/5 bg-slate-950/20 opacity-55")
                      : (tool.href 
                          ? "border-slate-200 bg-white/70 hover:-translate-y-2 hover:border-slate-300 hover:shadow-[0_15px_30px_rgba(15,23,42,0.08)]" 
                          : "border-slate-100 bg-slate-100/40 opacity-60")
                  }`}
                >
                  {/* Glowing top border indicator on hover */}
                  {tool.href && (
                    <div
                      className="absolute inset-x-0 top-0 h-[2px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${tool.accent}, transparent)`,
                      }}
                    />
                  )}
                  {/* Subtle background glow node on hover */}
                  {tool.href && (
                    <div
                      className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 pointer-events-none"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${tool.accent}15, transparent 65%)`,
                      }}
                    />
                  )}

                  <div className="relative z-10 flex h-full flex-col p-6">
                    <div
                      className={`mb-6 flex h-20 items-center justify-between rounded-2xl border p-4 shadow-inner transition-all ${
                        isDark ? "border-white/5 bg-white/[0.02]" : "border-slate-150 bg-slate-50"
                      }`}
                    >
                      <span className={`text-2xl font-black tracking-wider transition-colors ${isDark ? "text-slate-100" : "text-slate-900"}`}>{tool.panel}</span>
                      <div className={`p-2 rounded-xl border transition-all ${isDark ? "bg-white/[0.03] border-white/5" : "bg-white border-slate-200"}`}>
                        {getToolIcon(tool.title, tool.accent)}
                      </div>
                    </div>

                    <p
                      className="text-[10px] font-black uppercase tracking-[0.25em]"
                      style={{ color: tool.accent }}
                    >
                      {tool.label}
                    </p>
                    <h3 className={`mt-3 text-2xl font-black transition-colors ${isDark ? "text-white" : "text-slate-900"}`}>{tool.title}</h3>
                    <p className={`mt-3 flex-1 text-sm leading-6 transition-colors ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                      {tool.description}
                    </p>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <p className={`text-xs font-black uppercase tracking-[0.15em] transition-colors ${isDark ? "text-slate-350" : "text-slate-700"}`}>
                        {tool.href ? "Launch Tool" : "Coming Soon"}
                      </p>
                      {tool.href ? (
                        <span className={`transition-all group-hover:translate-x-1 ${isDark ? "text-slate-400 group-hover:text-white" : "text-slate-600 group-hover:text-slate-900"}`}>
                          →
                        </span>
                      ) : (
                        <span className="text-slate-400 text-sm">🔒</span>
                      )}
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>

        {/* Balance details history popup modal */}
        {showBalanceDetails && apiKey && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md transition-opacity duration-300">
            <div className={`relative w-full max-w-lg rounded-[32px] border p-8 shadow-2xl overflow-hidden transition-all ${
              isDark 
                ? "border-white/10 bg-[#0c0f16]/95 text-slate-100" 
                : "border-slate-200 bg-white text-slate-900"
            }`}>
              {/* Background glows */}
              {isDark && (
                <>
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-amber-500/10 blur-[80px]" />
                  <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-[80px]" />
                </>
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.25em] ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                      Account Dashboard
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Balance & Usage
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowBalanceDetails(false)}
                    className={`rounded-2xl border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                      isDark 
                        ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white" 
                        : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    Close
                  </button>
                </div>

                <p className={`mt-2 text-xs transition-colors ${isDark ? "text-slate-500" : "text-slate-500"}`}>
                  Connected Key: <span className="font-mono">{maskKey(apiKey)}</span>
                </p>

                <div className="mt-6">
                  {/* Render PollinationsAccountPanel with compact setting */}
                  <PollinationsAccountPanel apiKey={apiKey} compact={isDark} />
                </div>
              </div>
            </div>
          </div>
        )}

        {showConnect && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 px-4 backdrop-blur-md transition-opacity duration-300">
            <div className={`relative w-full max-w-lg rounded-[32px] border p-8 shadow-2xl overflow-hidden transition-all ${
              isDark 
                ? "border-white/10 bg-slate-900/90 text-slate-100" 
                : "border-slate-200 bg-white text-slate-900"
            }`}>
              {/* Background glows in modal */}
              {isDark && (
                <>
                  <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-500/10 blur-[80px]" />
                  <div className="absolute -left-20 -bottom-20 h-40 w-40 rounded-full bg-fuchsia-500/10 blur-[80px]" />
                </>
              )}

              <div className="relative z-10">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                      Authentication
                    </p>
                    <h2 className="mt-2 text-2xl font-black">
                      Connect your API Key
                    </h2>
                  </div>
                  {apiKey && (
                    <button
                      type="button"
                      onClick={() => setShowConnect(false)}
                      className={`rounded-2xl border px-3.5 py-1.5 text-xs font-bold transition cursor-pointer ${
                        isDark 
                          ? "border-white/10 bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white" 
                          : "border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900"
                      }`}
                    >
                      Close
                    </button>
                  )}
                </div>

                <p className={`mt-4 text-sm leading-6 font-medium transition-colors ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                  Authorize MythFlair through Pollinations or paste a temporary `sk_...` key. Your key is stored securely on your local browser.
                </p>

                <button
                  type="button"
                  onClick={authorizePollinations}
                  className="mt-6 w-full rounded-2xl bg-gradient-to-r from-fuchsia-500 to-cyan-500 py-3.5 text-sm font-black uppercase tracking-[0.15em] text-white shadow-lg shadow-fuchsia-500/15 hover:scale-[1.01] hover:shadow-fuchsia-500/25 transition-all cursor-pointer"
                >
                  Authorize with Pollinations
                </button>

                <div className="my-6 flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
                  <span className={`h-px flex-1 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
                  Or paste key manually
                  <span className={`h-px flex-1 ${isDark ? "bg-slate-800" : "bg-slate-200"}`} />
                </div>

                <div className="space-y-4">
                  <input
                    type="password"
                    value={manualKey}
                    onChange={(event) => setManualKey(event.target.value)}
                    placeholder="sk_..."
                    className={`w-full rounded-2xl border px-4 py-3.5 text-sm font-mono outline-none transition-all ${
                      isDark 
                        ? "border-slate-800 bg-slate-950/60 text-white placeholder:text-slate-600 focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20" 
                        : "border-slate-200 bg-slate-50 text-slate-900 placeholder:text-slate-400 focus:border-cyan-500/40 focus:ring-1 focus:ring-cyan-500/10"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={saveManualKey}
                    className={`w-full rounded-2xl border px-5 py-3.5 text-sm font-black uppercase tracking-[0.15em] transition cursor-pointer ${
                      isDark 
                        ? "border-slate-800 bg-slate-950/40 text-slate-300 hover:bg-slate-900/60 hover:text-white hover:border-slate-700" 
                        : "border-slate-250 bg-slate-100 text-slate-700 hover:bg-slate-150 hover:text-slate-900"
                    }`}
                  >
                    Save Key Locally
                  </button>
                </div>

                {apiKey && (
                  <button
                    type="button"
                    onClick={clearKey}
                    className={`mt-4 w-full rounded-2xl border px-5 py-3.5 text-sm font-black uppercase tracking-[0.15em] transition cursor-pointer ${
                      isDark 
                        ? "border-red-950 bg-red-950/20 text-red-400 hover:bg-red-950/40" 
                        : "border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                    }`}
                  >
                    Remove Saved Key
                  </button>
                )}

                {!appKey && (
                  <p className="mt-6 text-[11px] leading-5 text-slate-500">
                    Add `pollination_key=pk_...` in `.env.local` or environment config. The flow works without it, but attribution uses the hostname.
                  </p>
                )}
              </div>
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

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
    accent: "#10b981",
  },
  {
    id: "mistral",
    label: "Mistral Small 3.2",
    note: "Balanced writing and reasoning",
    accent: "#3b82f6",
  },
  {
    id: "llama-scout",
    label: "Meta Llama 4 Scout",
    note: "Fast creative answers",
    accent: "#8b5cf6",
  },
];

const codingModels = [
  {
    id: "qwen-coder",
    label: "Qwen3 Coder 30B",
    note: "Coding-focused low-pollen model",
    accent: "#0ea5e9",
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
  const [isDark, setIsDark] = useState(true);
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeModels = useMemo(
    () => (mode === "coding" ? codingModels : textModels),
    [mode]
  );

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

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
        <title>Pollinations Generator - MythFlair AI</title>
        <meta
          name="description"
          content="Generate text and code with low-pollen Pollinations models in MythFlair."
        />
      </Head>

      <main className={`relative h-screen overflow-hidden transition-colors duration-300 font-sans flex flex-col ${
        isDark ? "bg-[#0a0e27] text-slate-100" : "bg-slate-50 text-slate-900"
      }`}>
        {/* Header */}
        <header className={`border-b transition-all ${isDark ? "border-white/5 bg-[#0a0e27]/95 backdrop-blur-md" : "border-slate-200 bg-white/95 backdrop-blur-md"}`}>
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between gap-4 py-4">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className={`lg:hidden p-2 rounded-lg border transition-all ${
                    isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <Link href="/pollinations-ai" className="flex items-center gap-2">
                  <img src="/mythflair-logo.png" alt="MythFlair" className="h-8 w-8 rounded-md object-cover" />
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold leading-none">Pollinations Generator</p>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-emerald-400" : "text-emerald-600"}`}>
                      Low Pollen
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={() => setShowConnect(true)}
                  className={`px-3 py-2 rounded-lg border text-xs font-bold transition-all ${
                    apiKey
                      ? (isDark ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-700")
                      : (isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100")
                  }`}
                >
                  {apiKey ? maskKey(apiKey) : "Connect"}
                </button>

                <button
                  onClick={() => {
                    const newTheme = !isDark;
                    setIsDark(newTheme);
                    if (typeof window !== "undefined") {
                      window.localStorage.setItem("mythflair.pollinations.theme", newTheme ? "dark" : "light");
                    }
                  }}
                  className={`p-2 rounded-lg border transition-all ${
                    isDark ? "border-white/10 hover:bg-white/5 text-yellow-400" : "border-slate-200 hover:bg-slate-100 text-slate-700"
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
                  href="/pollinations-ai"
                  className={`p-2 rounded-lg border transition-all hidden sm:block ${
                    isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"
                  }`}
                  title="Exit"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar - Settings */}
          <div className={`fixed md:relative inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 md:translate-x-0 ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } ${isDark ? "border-r border-white/5 bg-[#0f1629]" : "border-r border-slate-200 bg-slate-100"}`}>
            <div
              className="flex flex-col h-full overflow-hidden"
            >
              {/* Close button on mobile */}
              <div className="md:hidden p-4 border-b border-white/5 flex justify-between items-center">
                <span className="font-bold text-sm">Settings</span>
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className={`p-1.5 rounded-lg border ${isDark ? "border-white/10 hover:bg-white/5" : "border-slate-300 hover:bg-slate-200"}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {/* Mode Selection */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-500 mb-3">Mode</p>
                  <div className={`grid grid-cols-2 gap-2 rounded-lg border p-1 ${
                    isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white"
                  }`}>
                    <button
                      type="button"
                      onClick={() => changeMode("text")}
                      className={`rounded px-3 py-2 text-xs font-bold transition-all ${
                        mode === "text" ? (isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-700") : ""
                      }`}
                    >
                      Text
                    </button>
                    <button
                      type="button"
                      onClick={() => changeMode("coding")}
                      className={`rounded px-3 py-2 text-xs font-bold transition-all ${
                        mode === "coding" ? (isDark ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-50 text-emerald-700") : ""
                      }`}
                    >
                      Coding
                    </button>
                  </div>
                </div>

                {/* Model Selection */}
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">Model</p>
                  <div className="space-y-2">
                    {activeModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => setSelectedModel(model.id)}
                        className={`w-full rounded-lg border p-3 text-left transition-all ${
                          selectedModel === model.id
                            ? (isDark ? "border-emerald-500/50 bg-emerald-500/10" : "border-emerald-400 bg-emerald-50/70")
                            : (isDark ? "border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10" : "border-slate-200 hover:border-slate-300 bg-white/50")
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: model.accent }} />
                          <span className="text-xs font-bold truncate">{model.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 line-clamp-1">{model.note}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Sidebar Footer */}
              <div className={`border-t p-4 space-y-2 ${isDark ? "border-white/5" : "border-slate-200"}`}>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">About Mode</p>
                <p className="text-xs leading-relaxed text-slate-400">
                  Text mode uses Nova, Mistral, and Llama. Coding mode uses Qwen3 Coder. All low-pollen models.
                </p>
              </div>
            </div>
          </div>

          {/* Overlay for mobile */}
          {sidebarOpen && (
            <div
              className="fixed inset-0 md:hidden bg-black/50 z-30"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Output Area */}
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6">
              <div className="max-w-4xl mx-auto w-full">
                {isGenerating ? (
                  <div className="h-full flex flex-col items-center justify-center">
                    <div className={`rounded-2xl px-4 py-3 text-sm flex items-center gap-1.5 shadow-sm border ${
                      isDark ? "bg-white/10 border-white/10 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500"
                    }`}>
                      <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="h-1.5 w-1.5 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                ) : result ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-4">
                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">Output</p>
                        <p className="text-sm font-bold mt-1">Generated Response</p>
                      </div>
                      <span className={`ml-auto px-3 py-2 rounded-lg text-xs font-bold border ${
                        isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-slate-50"
                      }`}>
                        {selectedModel}
                      </span>
                    </div>
                    <div className={`rounded-2xl px-4 py-3 text-sm leading-7 shadow-sm border ${
                      isDark ? "bg-white/10 border-white/10 text-slate-100" : "bg-slate-100 border-slate-200 text-slate-900"
                    }`}>
                      <pre className="whitespace-pre-wrap break-words">{result}</pre>
                    </div>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center space-y-6">
                    <div className="text-center space-y-2">
                      <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-emerald-400 to-emerald-600 bg-clip-text text-transparent mb-2">
                        ✨
                      </div>
                      <h1 className={`text-2xl sm:text-3xl font-black ${isDark ? "text-white" : "text-slate-900"}`}>
                        Pollinations Generator
                      </h1>
                      <p className={`text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Generate text and code with low-pollen models
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Input Area */}
            <form onSubmit={generateText} className={`border-t flex-shrink-0 p-4 sm:p-6 transition-colors ${isDark ? "border-white/5 bg-[#0a0e27]" : "border-slate-200 bg-white"}`}>
              <div className="mx-auto max-w-4xl">
                <div className="space-y-2">
                  <textarea
                    value={prompt}
                    onChange={(event) => setPrompt(event.target.value)}
                    placeholder={`Generate with ${selectedModel}...`}
                    className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition-all resize-none max-h-32 ${
                      isDark 
                        ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25" 
                        : "border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
                    }`}
                    disabled={!apiKey}
                  />
                  <div className="flex gap-3 items-end">
                    <button
                      type="submit"
                      disabled={isGenerating || !prompt.trim() || !apiKey}
                      className={`p-3 rounded-xl font-bold text-white transition-all flex-shrink-0 ${
                        isGenerating || !prompt.trim() || !apiKey
                          ? "bg-slate-600 cursor-not-allowed opacity-50"
                          : "bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 active:scale-95 shadow-lg hover:shadow-emerald-500/50"
                      }`}
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                    <p className="text-xs text-slate-500 flex-1">
                      {!apiKey && "Connect Pollinations to generate"}
                      {apiKey && isGenerating && "Generating..."}
                      {apiKey && !isGenerating && message && message}
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 md:hidden bg-black/50 z-30"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Connection Modal */}
        {showConnect && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 backdrop-blur-sm">
          <div className={`w-full max-w-lg rounded-xl border p-6 shadow-2xl transition-all ${
            isDark ? "border-white/10 bg-[#0f1629]" : "border-slate-200 bg-white"
          }`}>
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                  Pollinations Connection
                </p>
                <h2 className={`mt-2 text-2xl font-bold ${isDark ? "text-white" : "text-slate-900"}`}>
                  Connect your API key
                </h2>
              </div>
              {apiKey && (
                <button
                  type="button"
                  onClick={() => setShowConnect(false)}
                  className={`p-1.5 rounded-lg border ${isDark ? "border-white/10 hover:bg-white/5" : "border-slate-200 hover:bg-slate-100"}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            <p className={`text-sm leading-6 mb-4 ${isDark ? "text-slate-400" : "text-slate-600"}`}>
              Authorize MythFlair through Pollinations or paste a temporary `sk_...` key. It is stored locally in this browser.
            </p>

            <button
              type="button"
              onClick={authorizePollinations}
              className="w-full py-3 rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold transition-all"
            >
              Authorize with Pollinations
            </button>

            <div className="my-4 flex items-center gap-3 text-xs font-bold uppercase tracking-wider text-slate-500">
              <span className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
              Or paste key
              <span className={`h-px flex-1 ${isDark ? "bg-white/10" : "bg-slate-200"}`} />
            </div>

            <input
              type="password"
              value={manualKey}
              onChange={(event) => setManualKey(event.target.value)}
              placeholder="sk_..."
              className={`w-full rounded-lg border px-3 py-3 text-sm outline-none transition ${
                isDark 
                  ? "border-white/10 bg-white/5 text-white placeholder-slate-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25" 
                  : "border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/25"
              }`}
            />
            <button
              type="button"
              onClick={saveManualKey}
              className={`mt-3 w-full rounded-lg border px-5 py-3 text-sm font-bold transition ${
                isDark 
                  ? "border-white/10 bg-white/5 hover:bg-white/10" 
                  : "border-slate-200 bg-slate-50 hover:bg-slate-100"
              }`}
            >
              Save key locally
            </button>

            {apiKey && (
              <button
                type="button"
                onClick={clearKey}
                className="mt-3 w-full rounded-lg border border-red-500/20 bg-red-500/10 px-5 py-3 text-sm font-bold text-red-500 transition hover:bg-red-500/20"
              >
                Remove saved key
              </button>
            )}

            {!appKey && (
              <p className="mt-4 text-xs leading-5 text-slate-500">
                Add `pollination_key=pk_...` in `.env.local` and Vercel after creating a Pollinations App Key. Secret `sk_...` keys are not exposed as app keys.
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

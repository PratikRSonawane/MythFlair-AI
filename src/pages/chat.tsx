import Head from "next/head";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type ModelOption = {
  id: "codestral-latest" | "devstral-small-2:24b";
  label: string;
  note: string;
  accent: string;
};

type Message = {
  role: "user" | "assistant";
  content: string;
};

const chatModels: ModelOption[] = [
  {
    id: "codestral-latest",
    label: "Codestral Latest",
    note: "Coding-focused model for structured replies",
    accent: "#8b5cf6",
  },
  {
    id: "devstral-small-2:24b",
    label: "Devstral Small 2 (24B)",
    note: "Balanced general chat and reasoning",
    accent: "#06b6d4",
  },
];

const starterMessages: Message[] = [
  {
    role: "assistant",
    content: "Hello! Pick a model and start chatting with FreeChat.",
  },
];

export default function FreeChatPage() {
  const [isDark, setIsDark] = useState(true);
  const [selectedModel, setSelectedModel] = useState<ModelOption["id"]>("devstral-small-2:24b");
  const [messages, setMessages] = useState<Message[]>(starterMessages);
  const [input, setInput] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState("Ready");
  const [error, setError] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeModel = useMemo(
    () => chatModels.find((model) => model.id === selectedModel) ?? chatModels[0],
    [selectedModel]
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = window.localStorage.getItem("mythflair.freechat.theme");
      if (savedTheme === "light") setIsDark(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mythflair.freechat.theme", isDark ? "dark" : "light");
    }
  }, [isDark]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isGenerating) return;

    const userMessage = input.trim();
    setInput("");
    setError("");
    setIsGenerating(true);
    setStatus("Connecting...");

    const nextMessages: Message[] = [...messages, { role: "user", content: userMessage }];
    setMessages(nextMessages);

    try {
      const res = await fetch("https://api.llm7.io/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: selectedModel,
          messages: nextMessages,
        }),
      });

      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || `Request failed with status ${res.status}.`);
      }

      let assistantText = "";
      try {
        const payload = JSON.parse(text);
        assistantText =
          payload?.choices?.[0]?.message?.content ||
          payload?.message?.content ||
          payload?.output ||
          payload?.response ||
          "";
      } catch {
        assistantText = text;
      }

      setMessages((prev) => [...prev, { role: "assistant", content: assistantText || "No output returned." }]);
      setStatus("Ready");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unexpected failure.";
      setError(message);
      setMessages((prev) => [...prev, { role: "assistant", content: `Error: ${message}` }]);
      setStatus("Failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const promptSuggestions = [
    "Write a concise product description for a black and white photo editor.",
    "Explain the difference between REST and GraphQL in simple terms.",
    "Draft a warm reply to a customer asking about shipping times.",
    "Create a TypeScript function that retries failed requests.",
  ];

  return (
    <>
      <Head>
        <title>FreeChat - MythFlair AI</title>
        <meta name="description" content="Chat with Codestral Latest and Devstral Small 2 24B." />
      </Head>

      <main
        className={`relative h-screen overflow-hidden font-sans transition-colors duration-300 flex flex-col ${
          isDark ? "bg-[#0a0e27] text-slate-100" : "bg-slate-50 text-slate-900"
        }`}
      >
        <header
          className={`border-b transition-all ${isDark ? "border-white/5 bg-[#0a0e27]/95 backdrop-blur-md" : "border-slate-200 bg-white/95 backdrop-blur-md"}`}
        >
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
                <Link href="/" className="flex items-center gap-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/mythflair-logo.png" alt="MythFlair" className="h-8 w-8 rounded-md object-cover" />
                  <div className="hidden sm:block">
                    <p className="text-sm font-bold leading-none">FreeChat</p>
                    <p className={`text-xs font-bold uppercase tracking-wider ${isDark ? "text-violet-400" : "text-violet-600"}`}>
                      Chat
                    </p>
                  </div>
                </Link>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div
                  className={`hidden xs:flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-lg border text-[10px] font-bold uppercase tracking-wider transition-all ${
                    isGenerating
                      ? isDark
                        ? "border-amber-500/25 bg-amber-500/10 text-amber-400 animate-pulse"
                        : "border-amber-200 bg-amber-50 text-amber-700 animate-pulse"
                      : isDark
                        ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400"
                        : "border-emerald-200 bg-emerald-50 text-emerald-700"
                  }`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${isGenerating ? "bg-amber-500" : "bg-emerald-500"}`} />
                  <span className="hidden sm:inline">{status}</span>
                </div>

                <button
                  onClick={() => {
                    const newTheme = !isDark;
                    setIsDark(newTheme);
                  }}
                  className={`p-2 rounded-lg border transition-all ${
                    isDark ? "border-white/10 hover:bg-white/5 text-yellow-400" : "border-slate-200 hover:bg-slate-100 text-slate-700"
                  }`}
                  aria-label="Toggle theme"
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
              </div>
            </div>
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          <aside
            className={`fixed lg:relative inset-y-0 left-0 z-40 w-72 transform transition-transform duration-300 lg:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            } ${isDark ? "border-r border-white/5 bg-[#0f1629]" : "border-r border-slate-200 bg-slate-100"}`}
          >
            <div className="flex h-full flex-col overflow-hidden">
              <div className={`lg:hidden flex items-center justify-between border-b p-4 ${isDark ? "border-white/5" : "border-slate-200"}`}>
                <span className="text-sm font-bold">Models</span>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className={`rounded-lg border p-1.5 transition-all ${isDark ? "border-white/10 hover:bg-white/5" : "border-slate-300 hover:bg-slate-200"}`}
                >
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <div>
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-violet-500">AI Models</p>
                  <div className={`rounded-xl border p-4 ${isDark ? "border-white/10 bg-white/5" : "border-slate-200 bg-white/60"}`}>
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Active Model</p>
                    <p className="font-bold text-sm">{activeModel.label}</p>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-1">{activeModel.note}</p>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-white"}`}>
                        <p className="text-[10px] font-bold uppercase text-slate-500">Provider</p>
                        <p className="mt-1 font-bold">FreeChat</p>
                      </div>
                      <div className={`rounded-lg p-2 ${isDark ? "bg-white/5" : "bg-white"}`}>
                        <p className="text-[10px] font-bold uppercase text-slate-500">Status</p>
                        <p className="mt-1 font-bold">{status}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-2 px-1 text-xs font-bold uppercase tracking-wider text-slate-400">Featured</p>
                  <div className="space-y-2">
                    {chatModels.map((model) => (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => {
                          setSelectedModel(model.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full rounded-lg border p-3 text-left transition-all ${
                          selectedModel === model.id
                            ? isDark
                              ? "border-violet-500/50 bg-violet-500/10"
                              : "border-violet-400 bg-violet-50/70"
                            : isDark
                              ? "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10"
                              : "border-slate-200 bg-white/50 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="h-2.5 w-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: model.accent }} />
                          <span className="truncate text-xs font-bold">{model.label}</span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-[10px] text-slate-400">{model.note}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className={`border-t p-4 ${isDark ? "border-white/5" : "border-slate-200"}`}>
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500">About</p>
                <p className="mt-2 text-xs leading-relaxed text-slate-400">
                  this is a FreeChat text chat page. Select a model and generate directly from the browser, no data saved.
                </p>
              </div>
            </div>
          </aside>

          {sidebarOpen && <div className="fixed inset-0 z-30 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />}

          <main className="relative flex flex-1 flex-col overflow-hidden">
            <div className="flex-1 space-y-4 overflow-y-auto px-3 py-4 pb-[220px] sm:px-6 sm:py-6 lg:px-8">
              <div className="mx-auto w-full max-w-4xl space-y-4">
                {messages.length === 1 ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-8">
                    <div className="space-y-2 text-center">
                      <div className="mb-2 bg-gradient-to-r from-violet-400 to-violet-600 bg-clip-text text-4xl font-black text-transparent sm:text-5xl">
                        ✨
                      </div>
                      <h1 className={`text-2xl font-black sm:text-3xl ${isDark ? "text-white" : "text-slate-900"}`}>
                        Welcome to FreeChat
                      </h1>
                      <p className={`text-sm sm:text-base ${isDark ? "text-slate-400" : "text-slate-600"}`}>
                        Chat with text models, get help with code, writing, and more.
                      </p>
                    </div>

                    <div className="grid w-full max-w-2xl grid-cols-1 gap-3 sm:grid-cols-2">
                      {promptSuggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={() => setInput(suggestion)}
                          className={`rounded-xl border p-4 text-left transition-all hover:scale-[1.02] ${
                            isDark
                              ? "border-white/10 bg-white/5 hover:border-violet-500/50 hover:bg-violet-500/5"
                              : "border-slate-200 bg-white hover:border-violet-400 hover:bg-violet-50"
                          }`}
                        >
                          <span className={`block text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message, index) => {
                      const isUser = message.role === "user";

                      return (
                        <div key={`${message.role}-${index}`} className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
                          <div className={`max-w-xs space-y-2 sm:max-w-xl lg:max-w-2xl ${isUser ? "items-end" : "items-start"}`}>
                            {!isUser && (
                              <span className="px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                                {activeModel.label}
                              </span>
                            )}
                            <div
                              className={`rounded-2xl border px-4 py-3 text-sm leading-7 shadow-sm transition-all ${
                                isUser
                                  ? "rounded-br-none border-violet-700/50 bg-gradient-to-br from-violet-600 to-violet-700 text-white"
                                  : isDark
                                    ? "rounded-bl-none border-white/10 bg-white/10 text-slate-100"
                                    : "rounded-bl-none border-slate-200 bg-slate-100 text-slate-900"
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words">{message.content}</div>
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    {isGenerating && (
                      <div className="flex justify-start">
                        <div
                          className={`flex items-center gap-1.5 rounded-2xl rounded-bl-none border px-4 py-3 text-sm shadow-sm ${
                            isDark ? "border-white/10 bg-white/10 text-slate-400" : "border-slate-200 bg-slate-100 text-slate-500"
                          }`}
                        >
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "150ms" }} />
                          <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-current" style={{ animationDelay: "300ms" }} />
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </div>

            <div
              className={`absolute bottom-0 left-0 right-0 z-10 border-t ${
                isDark ? "border-white/5 bg-transparent" : "border-slate-200/10 bg-transparent"
              }`}
            >
              <div className="mx-auto max-w-4xl p-3 sm:p-4">
                <form onSubmit={handleSubmit}>
                  <div className="flex items-end gap-3">
                    <input
                      type="text"
                      value={input}
                      onChange={(event) => setInput(event.target.value)}
                      placeholder={`Chat with ${activeModel.label}...`}
                      className={`flex-1 rounded-xl border px-4 py-3 text-sm outline-none transition-all ${
                        isDark
                          ? "border-white/10 bg-transparent text-white placeholder-slate-500 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25"
                          : "border-slate-200/60 bg-transparent text-slate-900 placeholder-slate-400 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/25"
                      }`}
                    />
                    <button
                      type="submit"
                      disabled={isGenerating || !input.trim()}
                      className={`h-[48px] w-[48px] flex-shrink-0 rounded-xl font-bold text-white transition-all ${
                        isGenerating || !input.trim()
                          ? "cursor-not-allowed bg-slate-600 opacity-50"
                          : "bg-gradient-to-r from-violet-600 to-violet-700 shadow-lg hover:from-violet-700 hover:to-violet-800 active:scale-95 hover:shadow-violet-500/50"
                      }`}
                      aria-label="Send message"
                    >
                      <svg className="mx-auto h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                    </button>
                  </div>
                  <p className="mt-2 text-center text-xs text-slate-500">
                    {status}
                    {error ? ` · ${error}` : ""}
                  </p>
                </form>
              </div>
            </div>
          </main>
        </div>
      </main>
    </>
  );
}

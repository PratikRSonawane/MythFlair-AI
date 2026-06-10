import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";

type WorkspaceTool = {
  title: string;
  label: string;
  description: string;
  href?: string;
  panel: string;
  accent: string;
};

const tools: WorkspaceTool[] = [
  {
    title: "Chat",
    label: "Live text tool",
    description: "Generate responses, code, or creative scripts with advanced language models.",
    href: "/puter-text",
    panel: "CHAT",
    accent: "#2563eb",
  },
  {
    title: "Image",
    label: "Live tool",
    description: "Synthesize high-fidelity images from prompt descriptions.",
    href: "/puter-image",
    panel: "IMG",
    accent: "#0f766e",
  },
  {
    title: "Image to Image",
    label: "Coming soon",
    description: "A future space for image-guided generation and styling.",
    panel: "I2I",
    accent: "#9a3412",
  },
  {
    title: "TTS",
    label: "Coming soon",
    description: "A future text-to-speech engine for natural voice generation.",
    panel: "TTS",
    accent: "#be123c",
  },
  {
    title: "Embedding",
    label: "Coming soon",
    description: "A future embedding engine for retrieval and search.",
    panel: "EMB",
    accent: "#6d28d9",
  },
];

export default function WorkspaceLandingPage() {
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = window.localStorage.getItem("mythflair.pollinations.theme");
      if (savedTheme === "light") {
        setIsDark(false);
      }
    }
  }, []);

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
      case "Image to Image":
        return (
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="3" y="3" width="18" height="18" rx="4" stroke={accent} strokeWidth="2"/>
            <circle cx="9" cy="9" r="2.5" stroke={accent} strokeWidth="2"/>
            <path d="M3 18L9 12L15 18L19 14L21 16" stroke={accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
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
        <title>Creative Studio - MythFlair</title>
        <meta
          name="description"
          content="Choose a tool in the creative studio workspace: chat, image generation, audio, and visual motion."
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
                  <p className="mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.25em] bg-gradient-to-r from-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                    Creative Suite
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2.5">
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

                <div className={`px-4 py-2 rounded-2xl border text-xs font-bold ${
                  isDark ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-400" : "border-emerald-200 bg-emerald-50 text-emerald-700"
                }`}>
                  Engine Active
                </div>
              </div>
            </header>

            <div className="py-16 text-center max-w-3xl mx-auto space-y-6">
              <div className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] shadow-sm transition-all ${
                isDark 
                  ? "border-cyan-500/30 bg-cyan-500/10 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                  : "border-cyan-200 bg-cyan-50 text-cyan-700"
              }`}>
                <span className="h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse" />
                Creative Studio
              </div>
              <h1 className={`text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl transition-colors ${
                isDark ? "text-white" : "text-slate-900"
              }`}>
                Universal Creative{" "}
                <span className="bg-gradient-to-r from-violet-500 via-fuchsia-500 to-cyan-500 bg-clip-text text-transparent">
                  Workspace
                </span>
              </h1>
              <p className={`text-base leading-8 transition-colors ${
                isDark ? "text-slate-400" : "text-slate-600"
              }`}>
                Select an experience from the options below to configure, prompt, and generate content. All outputs are managed natively within your current browser session.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:py-16">
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
      </main>
    </>
  );
}

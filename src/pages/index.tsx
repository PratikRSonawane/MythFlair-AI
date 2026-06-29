import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function HomePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data?.user) {
        setUser(data.user);
      }
    });
  }, []);

  return (
    <>
      <Head>
        <title>MythFlair AI</title>
        <meta name="theme-color" content="#f8fafc" />
        <meta
          name="description"
          content="MythFlair AI is a creative sandbox to express your imagination through AI image synthesis, natural language generation, audio models, and visual motion."
        />
        <meta property="og:title" content="MythFlair AI" />
        <meta
          property="og:description"
          content="Express your imagination through AI image synthesis, natural language generation, and voice tools on MythFlair AI."
        />
        <meta property="og:image" content="/mythflair-logo.png" />
      </Head>

      <main className="relative min-h-screen overflow-hidden bg-gradient-to-tr from-[#f8fafc] via-[#f5f3ff] to-[#f0fdf4] text-slate-800 font-sans selection:bg-violet-500/20 selection:text-violet-900">
        {/* Soft, vibrant colorful blur blobs for a distinct light gradient theme */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(to_right,#e2e8f080_1px,transparent_1px),linear-gradient(to_bottom,#e2e8f080_1px,transparent_1px)] bg-[size:5rem_5rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
          <div className="absolute left-[-10%] top-[-10%] h-[500px] w-[500px] rounded-full bg-fuchsia-400/15 blur-[120px] animate-pulse" style={{ animationDuration: '10s' }} />
          <div className="absolute right-[-5%] top-[10%] h-[600px] w-[600px] rounded-full bg-cyan-400/15 blur-[140px] animate-pulse" style={{ animationDuration: '14s' }} />
          <div className="absolute bottom-[-10%] left-[20%] h-[500px] w-[500px] rounded-full bg-violet-400/10 blur-[130px] animate-pulse" style={{ animationDuration: '12s' }} />
        </div>

        <section className="relative border-b border-slate-200/60">
          <div className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:py-8">
            <header className="flex items-center justify-between gap-4 rounded-3xl border border-slate-200/80 bg-white/60 p-4 shadow-[0_8px_32px_rgba(15,23,42,0.04)] backdrop-blur-xl transition-all">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative overflow-hidden rounded-2xl border border-slate-200 transition-transform duration-300 group-hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-tr from-violet-500 to-fuchsia-500 opacity-15" />
                  <img
                    src="/mythflair-logo.png"
                    alt="MythFlair"
                    className="h-11 w-11 object-cover relative z-10"
                  />
                </div>
                <div>
                  <p className="font-black leading-none text-slate-900 tracking-wide">MythFlair AI</p>
                  <p className="mt-1.5 text-[9px] font-extrabold uppercase tracking-[0.25em] bg-gradient-to-r from-violet-600 to-fuchsia-600 bg-clip-text text-transparent">
                    Creative Suite
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2.5">
                {/* Dynamic Sign In / Profile button - Only option in top-right corner */}
                {user ? (
                  <Link
                    href="/profile"
                    className="rounded-2xl border border-emerald-500/20 bg-emerald-50 px-4 py-2 text-xs sm:text-sm font-bold text-emerald-700 hover:bg-emerald-100 transition-all cursor-pointer"
                  >
                    👤 Profile
                  </Link>
                ) : (
                  <Link
                    href="/signin"
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-2 text-xs sm:text-sm font-bold text-slate-700 shadow-sm hover:bg-slate-50 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </header>

            <div className="grid gap-12 py-16 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
              <div className="max-w-3xl space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-violet-200 bg-violet-50 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-violet-750 shadow-sm">
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-500" />
                  Creative Workspace
                </div>
                <h1 className="text-4xl font-black leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl text-slate-900">
                  Express your imagination with{" "}
                  <span className="bg-gradient-to-r from-violet-650 to-fuchsia-600 bg-clip-text text-transparent">
                    MythFlair AI.
                  </span>
                </h1>
                <p className="text-base leading-8 text-slate-600 sm:text-lg">
                  Welcome to MythFlair AI, an open environment designed to help you experiment with machine learning generators. Craft photo-realistic visuals, synthesize human-like voice recordings, write structured copy, or generate motion sequences.
                </p>
              </div>

              {/* The Single AI Engine Box - ONLY place where providers are chosen */}
              <div className="relative group">
                <div className="absolute -inset-0.5 rounded-[32px] bg-gradient-to-r from-violet-400 to-fuchsia-400 opacity-15 blur-xl transition duration-500 group-hover:opacity-25" />
                <div className="relative rounded-[28px] border border-slate-200/80 bg-white/70 p-6 backdrop-blur-xl shadow-xl space-y-4">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400">
                      System Setup
                    </p>
                    <h2 className="mt-1 text-2xl font-black text-slate-900">
                      Choose AI Engine
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">
                      Select a connected engine to power your current generation session.
                    </p>
                  </div>


                  {/* Provider 1: image */}
                  <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm hover:border-slate-300 transition duration-300">
                    <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-violet-50 border border-violet-100 text-violet-600">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Image</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Vibrant images, chat models, and voice</p>
                        </div>
                      </div>
                      <Link
                        href="/image"
                        className="w-full sm:w-auto text-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-black text-white shadow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                      >
                        Connect & Open
                      </Link>
                    </div>
                  </div>

                   {/* Provider 2: Puter AI */}
                  <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm hover:border-slate-300 transition duration-300">
                    <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-600">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Chat</h3>
                          <p className="text-xs text-slate-500 mt-0.5">High-speed native cloud model hub</p>
                        </div>
                      </div>
                      <Link
                        href="/chat"
                        className="w-full sm:w-auto text-center rounded-xl bg-gradient-to-r from-violet-650 to-fuchsia-600 px-4 py-2.5 text-xs font-black text-white shadow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                      >
                        Connect & Open
                      </Link>
                    </div>
                  </div>

                  {/* Provider 3: low q image */}
                  <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm hover:border-slate-300 transition duration-300">
                    <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-violet-50 border border-violet-100 text-violet-600">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">low quality unlimited image</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Vibrant images, chat models, and voice</p>
                        </div>
                      </div>
                      <Link
                        href="/low-polly"
                        className="w-full sm:w-auto text-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-black text-white shadow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                      >
                        Connect & Open
                      </Link>
                    </div>
                  </div>


                  {/* Provider 4: Pollinations AI */}
                  <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm hover:border-slate-300 transition duration-300">
                    <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-violet-50 border border-violet-100 text-violet-600">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Pollinations AI</h3>
                          <p className="text-xs text-slate-500 mt-0.5">Vibrant images, chat models, and voice</p>
                        </div>
                      </div>
                      <Link
                        href="/pollinations-ai"
                        className="w-full sm:w-auto text-center rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-xs font-black text-white shadow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                      >
                        Connect & Open
                      </Link>
                    </div>
                  </div>

                  {/* Provider 5: Puter AI */}
                  <div className="rounded-2xl border border-slate-200/60 bg-white/90 p-4 shadow-sm hover:border-slate-300 transition duration-300">
                    <div className="flex items-start justify-between gap-3 flex-wrap sm:flex-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 rounded-xl bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-600">
                          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-sm font-bold text-slate-900">Puter AI</h3>
                          <p className="text-xs text-slate-500 mt-0.5">High-speed native cloud model hub</p>
                        </div>
                      </div>
                      <Link
                        href="/puter-ai"
                        className="w-full sm:w-auto text-center rounded-xl bg-gradient-to-r from-violet-650 to-fuchsia-600 px-4 py-2.5 text-xs font-black text-white shadow hover:scale-[1.02] active:scale-[0.98] transition cursor-pointer"
                      >
                        Connect & Open
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Informational Sections describing AI technology */}
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8">
          <div className="mb-10 max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.25em] text-violet-600">
              Understanding AI
            </p>
            <h2 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">
              What can you build on MythFlair?
            </h2>
            <p className="mt-3 text-slate-650 leading-7">
              Discover how generative AI architectures process instructions to generate visual, textual, and acoustic outputs.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Card 1: AI Image Synthesis */}
            <article className="group relative rounded-[28px] border border-slate-200/80 bg-white/50 p-8 shadow-sm hover:shadow-md transition-all duration-350">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-blue-50 border border-blue-100 text-blue-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <rect x="3" y="3" width="18" height="18" rx="4"/>
                    <circle cx="9" cy="9" r="2.5"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 18l6-6 6 6m4-4l2 2m-2-2l-4-4-4 4"/>
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">AI Image Generation</h3>
                  <p className="text-sm leading-7 text-slate-600">
                    AI image generation translates descriptive prompts into graphics, digital art, or photographic assets. Using advanced diffusion networks, the AI begins with structured random noise and iteratively refines it, matching lighting cues, stylistic context, and camera properties to compile the final render.
                  </p>
                  <p className="text-xs font-semibold text-blue-700 bg-blue-50/80 inline-block px-3 py-1.5 rounded-xl">
                    Use Cases: Digital art, concept prototyping, illustration rendering
                  </p>
                </div>
              </div>
            </article>

            {/* Card 2: AI Text Generation */}
            <article className="group relative rounded-[28px] border border-slate-200/80 bg-white/50 p-8 shadow-sm hover:shadow-md transition-all duration-350">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-fuchsia-50 border border-fuchsia-100 text-fuchsia-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">AI Text Generation</h3>
                  <p className="text-sm leading-7 text-slate-600">
                    Natural language generation leverages Large Language Models (LLMs) to construct contextual responses. By estimating word probabilities based on millions of textual relationships, LLMs compose creative scripts, compile structured reports, assist in editing copy, or troubleshoot coding errors.
                  </p>
                  <p className="text-xs font-semibold text-fuchsia-700 bg-fuchsia-50/80 inline-block px-3 py-1.5 rounded-xl">
                    Use Cases: Writing assistance, interactive chat, logic validation
                  </p>
                </div>
              </div>
            </article>

            {/* Card 3: AI Text-to-Speech */}
            <article className="group relative rounded-[28px] border border-slate-200/80 bg-white/50 p-8 shadow-sm hover:shadow-md transition-all duration-350">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 text-emerald-600">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">AI Speech Synthesis (TTS)</h3>
                  <p className="text-sm leading-7 text-slate-600">
                    Text-to-Speech (TTS) models translate written copy into acoustic audio files. Modern speech networks capture emotional cues, sentence pacing, and natural intonation patterns, producing high-fidelity audio streams suitable for narration or vocal feedback.
                  </p>
                  <p className="text-xs font-semibold text-emerald-700 bg-emerald-50/80 inline-block px-3 py-1.5 rounded-xl">
                    Use Cases: Audio narration, vocal output, accessibility rendering
                  </p>
                </div>
              </div>
            </article>

            {/* Card 4: AI Motion & Video */}
            <article className="group relative rounded-[28px] border border-slate-200/80 bg-white/50 p-8 shadow-sm hover:shadow-md transition-all duration-350">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-2xl bg-orange-50 border border-orange-100 text-orange-655">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l5-3v10l-5-3v-4zM4 6h10a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2V8a2 2 0 012-2z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-slate-900">AI Motion & Video</h3>
                  <p className="text-sm leading-7 text-slate-600">
                    Temporal motion networks generate coherent frame sequences to produce short video outputs. The system interpolates pixel shifts and object consistency across timelines, creating smooth transitions, panning sweeps, or environmental motion from static commands.
                  </p>
                  <p className="text-xs font-semibold text-orange-700 bg-orange-50/85 inline-block px-3 py-1.5 rounded-xl">
                    Use Cases: Cinematic loops, motion mockups, storytelling frames
                  </p>
                </div>
              </div>
            </article>
          </div>
        </section>
      </main>
    </>
  );
}

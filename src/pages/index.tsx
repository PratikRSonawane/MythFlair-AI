import Head from "next/head";
import Link from "next/link";

type HomeTool = {
  title: string;
  label: string;
  description: string;
  href?: string;
  status: "Live" | "Preview" | "Soon";
  accent: string;
  panel: string;
};

const primaryTools: HomeTool[] = [
  {
    title: "Pollinations AI",
    label: "Free provider",
    description:
      "Connect Pollinations once, then choose chat, image, video, TTS, or embedding tools.",
    href: "/pollinations-ai",
    status: "Live",
    accent: "#0f766e",
    panel: "POL",
  },
  {
    title: "Creative Studio Hub",
    label: "Image, video, text",
    description:
      "Open the focused hub page that was previously the MythFlair home screen.",
    href: "/creative-studio",
    status: "Live",
    accent: "#1d4ed8",
    panel: "HUB",
  },
  {
    title: "Video Generator",
    label: "Prompt to video",
    description:
      "A future workspace for short AI videos, motion prompts, and render history.",
    status: "Soon",
    accent: "#9a3412",
    panel: "VID",
  },
  {
    title: "Text Generator",
    label: "Writing tools",
    description:
      "A future area for captions, stories, product copy, summaries, and prompts.",
    status: "Soon",
    accent: "#6d28d9",
    panel: "TXT",
  },
];

const freeProviders: HomeTool[] = [
  {
    title: "Pollinations AI",
    label: "Images, chat, TTS, video",
    description:
      "A free provider gateway with BYOP connection and separate tool choices.",
    href: "/pollinations-ai",
    status: "Live",
    accent: "#0f766e",
    panel: "POL",
  },
  {
    title: "More Free Providers",
    label: "Provider slots",
    description:
      "Add other free AI providers here as the project grows.",
    status: "Soon",
    accent: "#64748b",
    panel: "+",
  },
];

const designTools: HomeTool[] = [
  {
    title: "UI Design Ideas",
    label: "Layouts",
    description:
      "Generate page directions, sections, color systems, and app layout concepts.",
    status: "Preview",
    accent: "#be123c",
    panel: "UI",
  },

  {
    title: "Prompt Library",
    label: "Reusable prompts",
    description:
      "Save repeatable prompt patterns for images, videos, writing, and UI work.",
    status: "Soon",
    accent: "#047857",
    panel: "LIB",
  },
];

function ToolCard({ tool }: { tool: HomeTool }) {
  const statusStyles: Record<HomeTool["status"], string> = {
    Live: "border-[#0f766e]/30 bg-[#dff5ef] text-[#0f5f58]",
    Preview: "border-[#1d4ed8]/30 bg-[#e0e7ff] text-[#1d4ed8]",
    Soon: "border-[#9a3412]/25 bg-[#fff1e8] text-[#9a3412]",
  };

  const statusDot: Record<HomeTool["status"], string> = {
    Live: "bg-[#0f766e]",
    Preview: "bg-[#1d4ed8]",
    Soon: "bg-[#9a3412]",
  };

  const content = (
    <article
      className={`group relative flex h-full min-h-[260px] flex-col overflow-hidden rounded-xl border border-black/10 bg-white p-5 shadow-sm transition will-change-transform ${
        tool.href
          ? "hover:-translate-y-1 hover:shadow-2xl"
          : "opacity-75"
      }`}
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        aria-hidden="true"
        style={{
          background: `radial-gradient(600px circle at 10% -10%, ${tool.accent}33, transparent 40%), radial-gradient(500px circle at 110% 0%, ${tool.accent}22, transparent 35%)`,
        }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-1 opacity-90"
        style={{ background: `linear-gradient(90deg, ${tool.accent}99, transparent)` }}
      />
      <div
        className="mb-7 flex h-24 items-end justify-between rounded bg-[#f3f0e8] p-4"
        style={{ color: tool.accent }}
      >
        <span className="text-3xl font-black">{tool.panel}</span>
        <span className="grid h-11 w-11 grid-cols-2 gap-1 rounded-sm border-2 border-current p-1">
          <span className="rounded-sm bg-current opacity-30" />
          <span className="rounded-sm bg-current opacity-70" />
          <span className="rounded-sm bg-current opacity-70" />
          <span className="rounded-sm bg-current opacity-30" />
        </span>
      </div>

      <div className="mb-3 flex items-center justify-between gap-3">
        <p
          className="text-xs font-black uppercase tracking-[0.14em]"
          style={{ color: tool.accent }}
        >
          {tool.label}
        </p>
        <span
          className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-[0.1em] ${statusStyles[tool.status]}`}
        >
          <span
            className={`h-2 w-2 rounded-full ${statusDot[tool.status]}`}
            aria-hidden="true"
          />
          {tool.status}
        </span>
      </div>

      <h3 className="text-2xl font-black leading-tight text-[#111713]">
        {tool.title}
      </h3>
      <p className="mt-3 flex-1 text-sm leading-6 text-[#5a665e]">
        {tool.description}
      </p>
      <p className="mt-6 text-sm font-black uppercase tracking-[0.12em] text-[#111713]">
        {tool.href ? "Open" : "Coming soon"}
      </p>
    </article>
  );

  return (
    <Link
      href={tool.href ?? "#"}
      aria-disabled={!tool.href}
      onClick={(event) => {
        if (!tool.href) {
          event.preventDefault();
        }
      }}
      className={`h-full ${!tool.href ? "cursor-default" : ""}`}
    >
      {content}
    </Link>
  );
}

export default function HomePage() {
  return (
    <>
      <Head>
        <title>MythFlair AI - Free AI Tools</title>
        <meta name="theme-color" content="#0f766e" />
        <meta
          name="description"
          content="MythFlair AI is a centralized home for free AI image tools, creative generation, UI design ideas, and upcoming text and video tools."
        />
        <meta property="og:title" content="MythFlair AI - Free AI Tools" />
        <meta
          property="og:description"
          content="Explore MythFlair AI tools for image generation, creative workflows, UI design ideas, and future text and video generation."
        />
        <meta property="og:image" content="/mythflair-logo.png" />
      </Head>

      <main className="relative min-h-screen bg-[#f7f4ed] text-[#111713]">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(900px circle at 15% 15%, rgba(14,165,233,0.18), transparent 55%), radial-gradient(900px circle at 85% 10%, rgba(29,78,216,0.18), transparent 50%), radial-gradient(1100px circle at 70% 80%, rgba(190,18,60,0.14), transparent 55%), radial-gradient(900px circle at 10% 85%, rgba(15,118,110,0.14), transparent 55%)",
          }}
        />
        <section className="relative overflow-hidden border-b border-black/10">
          <div className="absolute inset-0">
            <img
              src="/mythflair-logo.png"
              alt=""
              className="h-full w-full object-cover opacity-[0.06]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(247,244,237,0.98),rgba(247,244,237,0.9)_48%,rgba(225,238,232,0.76))]" />
          </div>

          <div className="relative mx-auto flex min-h-[86vh] max-w-7xl flex-col px-5 py-5 sm:px-8">
            <header className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <img
                  src="/mythflair-logo.png"
                  alt="MythFlair"
                  className="h-11 w-11 rounded-md object-cover shadow-sm"
                />
                <div>
                  <p className="text-lg font-black leading-none">
                    MythFlair AI
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.16em] text-[#5f6d64]">
                    Free Tools
                  </p>
                </div>
              </Link>

              <div className="flex items-center gap-2">
                <Link
                  href="/creative-studio"
                  className="hidden rounded-md border border-black/15 bg-white/70 px-4 py-2 text-sm font-black transition hover:bg-white sm:inline-flex"
                >
                  Studio Hub
                </Link>
                <Link
                  href="/pollinations-ai"
                  className="rounded-md bg-[#111713] px-4 py-2 text-sm font-black text-white transition hover:bg-[#0f766e]"
                >
                  Providers
                </Link>
              </div>
            </header>

            <div className="grid flex-1 items-center gap-10 py-12 lg:grid-cols-[1fr_0.9fr]">
              <div className="max-w-3xl">
                <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#0f766e]/30 bg-[#dff5ef] px-3 py-1 text-sm font-black text-[#0f5f58] shadow-sm">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#0f766e]" aria-hidden="true" />
                  Universal free AI tools
                </p>
                <h1 className="text-5xl font-black leading-[0.96] tracking-normal sm:text-6xl lg:text-7xl">
                  <span className="bg-[linear-gradient(90deg,#0f766e_0%,#1d4ed8_45%,#be123c_100%)] bg-clip-text text-transparent">
                    One home
                  </span>
                  <span className="block">for creative AI work.</span>
                </h1>
                <p className="mt-6 max-w-2xl text-base leading-7 text-[#526057] sm:text-lg">
                  Start by choosing a free provider, then pick the tool you
                  want from that provider: chat, images, video, TTS, embeddings,
                  and more as MythFlair grows.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/pollinations-ai"
                    className="rounded-md bg-[#111713] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_34px_rgba(17,23,19,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0f766e]"
                  >
                    Open Free Providers
                  </Link>
                  <Link
                    href="/creative-studio"
                    className="rounded-md border border-black/15 bg-white/75 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] transition hover:bg-white"
                  >
                    Open Studio Hub
                  </Link>
                </div>
              </div>

              <div className="rounded-md border border-black/10 bg-white p-4 shadow-2xl shadow-black/10">
                <div className="grid gap-3 sm:grid-cols-2">
                  {["Providers", "Chat", "Image", "TTS"].map((item, index) => (
                    <div
                      key={item}
                      className={`min-h-36 rounded-md p-4 ${
                        index === 0
                          ? "bg-[#14342c] text-[#dff5ef]"
                          : "bg-[#f0ece2] text-[#19211c]"
                      }`}
                    >
                      <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">
                        Tool {index + 1}
                      </p>
                      <p className="mt-6 text-3xl font-black">{item}</p>
                      <p className="mt-2 text-sm font-bold opacity-75">
                        {index === 0 ? "Start here" : "Provider tools"}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0f766e]">
              Free providers
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Choose a provider first
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5a665e]">
              Provider pages handle the connection popup first, then show the
              tools available inside that provider.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {freeProviders.map((tool) => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-5 pb-14 sm:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1d4ed8]">
              Main areas
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Tool categories
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5a665e]">
              These cards show the broader direction of the app. The provider
              section is the main entry point for free connected tools.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {primaryTools.map((tool) => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </div>
        </section>

        {/* UI and creator extras moved to a more colorful bottom CTA section above */}
        {/* (removed duplicate old section) */}
        <section className="border-t border-black/10 bg-[#ebe7dc]">
          <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="mb-8 max-w-3xl">
            <p className="text-sm font-black uppercase tracking-[0.16em] text-[#be123c]">
              UI and creator extras
            </p>
            <h2 className="mt-2 text-3xl font-black sm:text-4xl">
              Design helpers and portfolio tools
            </h2>
            <p className="mt-3 text-sm leading-6 text-[#5a665e]">
              This gives the project room to become more than an image
              generator: design ideas, public portfolio, and reusable prompt
              systems can all live here.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {designTools.map((tool) => (
              <ToolCard key={tool.title} tool={tool} />
            ))}
          </div>

          <div className="mt-10 flex flex-col items-start justify-between gap-6 rounded-2xl border border-black/10 bg-white/70 p-6 shadow-sm sm:flex-row sm:items-center">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#1d4ed8]">
                Quick start
              </p>
              <h3 className="mt-2 text-xl font-black">Pick a provider, then choose the tool</h3>
              <p className="mt-2 text-sm leading-6 text-[#5a665e]">
                Everything on MythFlair starts with the provider connection popup — then your tools appear.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:items-end">
              <Link
                href="/pollinations-ai"
                className="rounded-md bg-[#111713] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_16px_34px_rgba(17,23,19,0.2)] transition hover:-translate-y-0.5 hover:bg-[#0f766e]"
              >
                Explore Providers
              </Link>
              <div className="text-xs font-bold uppercase tracking-[0.12em] text-[#5f6d64]">
                Live: Pollinations • Soon: Video & Text
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
    </>
  );
}

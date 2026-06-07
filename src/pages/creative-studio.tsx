import Head from "next/head";
import Link from "next/link";

type ToolCard = {
  title: string;
  status: string;
  description: string;
  href?: string;
  accent: string;
  preview: string;
};

const tools: ToolCard[] = [
  {
    title: "Image Generation",
    status: "Live with Pollinations",
    description:
      "Create artwork from prompts with your connected Pollinations key.",
    href: "/ai-image",
    accent: "#0f766e",
    preview: "IMG",
  },
  {
    title: "Video Generation",
    status: "Coming soon",
    description:
      "A focused space for prompt-to-video tools when the provider flow is ready.",
    accent: "#7c2d12",
    preview: "VID",
  },
  {
    title: "Text Generation",
    status: "Coming soon",
    description:
      "Draft stories, captions, prompts, and creative text from one clean studio.",
    accent: "#1d4ed8",
    preview: "TXT",
  },
];

export default function CreativeStudioPage() {
  return (
    <>
      <Head>
        <title>MythFlair AI - Creative Generation Studio</title>
        <meta
          name="description"
          content="MythFlair AI is a creative generation hub for image, video, and text tools."
        />
        <meta property="og:title" content="MythFlair AI" />
        <meta
          property="og:description"
          content="Create AI images now and explore upcoming video and text generation tools."
        />
        <meta property="og:image" content="/mythflair-logo.png" />
      </Head>

      <main className="min-h-screen bg-[#f4f1ea] text-[#17201b]">
        <section className="relative min-h-[92vh] overflow-hidden border-b border-black/10">
          <div className="absolute inset-0">
            <img
              src="/mythflair-logo.png"
              alt=""
              className="h-full w-full object-cover opacity-[0.08]"
            />
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(244,241,234,0.98)_0%,rgba(244,241,234,0.9)_42%,rgba(226,238,231,0.78)_100%)]" />
            <div className="absolute bottom-0 left-0 right-0 h-40 bg-[linear-gradient(0deg,#f4f1ea,rgba(244,241,234,0))]" />
          </div>

          <div className="relative mx-auto flex min-h-[92vh] max-w-7xl flex-col px-5 py-5 sm:px-8">
            <header className="flex items-center justify-between gap-4">
              <Link href="/" className="flex items-center gap-3">
                <img
                  src="/mythflair-logo.png"
                  alt="MythFlair"
                  className="h-11 w-11 rounded-md object-cover shadow-sm"
                />
                <div>
                  <p className="text-lg font-black leading-none tracking-normal">
                    MythFlair AI
                  </p>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-[0.16em] text-[#58665d]">
                    Creative Studio
                  </p>
                </div>
              </Link>

              <Link
                href="/signin"
                className="rounded-md border border-black/15 bg-white/70 px-4 py-2 text-sm font-bold text-[#17201b] shadow-sm transition hover:bg-white"
              >
                Sign in
              </Link>
            </header>

            <div className="grid flex-1 items-center gap-10 py-10 lg:grid-cols-[0.95fr_1.05fr] lg:py-14">
              <div className="max-w-3xl">
                <p className="mb-5 inline-flex rounded-md border border-[#0f766e]/25 bg-[#dff5ef] px-3 py-1 text-sm font-bold text-[#0f5f58]">
                  Pollinations image generation is live
                </p>
                <h1 className="text-5xl font-black leading-[0.95] tracking-normal text-[#101713] sm:text-6xl lg:text-7xl">
                  Build the thing in your head.
                </h1>
                <p className="mt-6 max-w-xl text-base leading-7 text-[#4f5d55] sm:text-lg">
                  MythFlair is becoming one place for image, video, and text
                  generation. Start with images today, then expand the studio as
                  the other tools are ready.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="/ai-image"
                    className="rounded-md bg-[#111713] px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white shadow-[0_14px_30px_rgba(17,23,19,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0f766e]"
                  >
                    Open Image Studio
                  </Link>
                  <a
                    href="#tools"
                    className="rounded-md border border-black/15 bg-white/70 px-5 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-[#17201b] transition hover:bg-white"
                  >
                    View Tools
                  </a>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="min-h-[320px] rounded-md border border-black/10 bg-[#13231f] p-4 text-white shadow-2xl sm:col-span-2">
                  <div className="flex h-full flex-col justify-between overflow-hidden rounded border border-white/10 bg-[radial-gradient(circle_at_70%_15%,rgba(85,184,155,0.55),transparent_32%),linear-gradient(140deg,#101713,#214238_60%,#d0a44c)] p-5">
                    <div className="flex items-center justify-between text-xs font-black uppercase tracking-[0.16em] text-white/80">
                      <span>Live canvas</span>
                      <span>BYOP ready</span>
                    </div>
                    <div>
                      <p className="text-4xl font-black leading-none">
                        Prompt
                        <br />
                        to image
                      </p>
                      <p className="mt-4 max-w-sm text-sm leading-6 text-white/75">
                        Connect Pollinations, choose a model, and render your
                        next visual without leaving the app.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-md border border-black/10 bg-white/70 p-4">
                  <p className="text-sm font-black text-[#0f766e]">
                    Current focus
                  </p>
                  <p className="mt-2 text-2xl font-black">Image generation</p>
                  <p className="mt-3 text-sm leading-6 text-[#5b675f]">
                    Pollinations changed its access model, so this page now
                    starts with a key connection.
                  </p>
                </div>

                <div className="rounded-md border border-black/10 bg-white/70 p-4">
                  <p className="text-sm font-black text-[#7c2d12]">
                    Next modules
                  </p>
                  <p className="mt-2 text-2xl font-black">Video and text</p>
                  <p className="mt-3 text-sm leading-6 text-[#5b675f]">
                    The links are visible, but kept closed until the workflows
                    are ready.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="tools" className="mx-auto max-w-7xl px-5 py-14 sm:px-8">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.16em] text-[#0f766e]">
                Studio tools
              </p>
              <h2 className="mt-2 text-3xl font-black tracking-normal sm:text-4xl">
                Choose a generator
              </h2>
            </div>
            <p className="max-w-lg text-sm leading-6 text-[#5b675f]">
              Only Pollinations image generation is open for now. The other
              cards are placeholders for the main project roadmap.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {tools.map((tool) => {
              const card = (
                <article
                  className={`group min-h-[270px] rounded-md border border-black/10 bg-white p-5 shadow-sm transition ${
                    tool.href
                      ? "hover:-translate-y-1 hover:shadow-xl"
                      : "opacity-70"
                  }`}
                >
                  <div
                    className="mb-10 flex h-24 items-end justify-between rounded bg-[#f4f1ea] p-4"
                    style={{ color: tool.accent }}
                  >
                    <span className="text-3xl font-black">{tool.preview}</span>
                    <span className="h-10 w-10 rounded-sm border-2 border-current" />
                  </div>
                  <p
                    className="mb-3 text-xs font-black uppercase tracking-[0.14em]"
                    style={{ color: tool.accent }}
                  >
                    {tool.status}
                  </p>
                  <h3 className="text-2xl font-black">{tool.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-[#5b675f]">
                    {tool.description}
                  </p>
                  <p className="mt-6 text-sm font-black uppercase tracking-[0.12em]">
                    {tool.href ? "Open tool" : "Locked for now"}
                  </p>
                </article>
              );

              return (
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
                  {card}
                </Link>
              );
            })}
          </div>
        </section>
      </main>
    </>
  );
}

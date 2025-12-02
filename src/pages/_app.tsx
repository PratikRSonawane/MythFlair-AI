import type { AppProps } from "next/app";
import Head from "next/head";
import "@/styles/globals.css";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        {/* Favicons for all pages */}
        <link rel="icon" href="/favicon.ico" />

        {/* iPhone/iPad icon */}
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />

        {/* Android icons */}
        <link
          rel="icon"
          type="image/png"
          sizes="192x192"
          href="/icon-192x192.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="512x512"
          href="/icon-512x512.png"
        />

        {/* Browser theming */}
        <meta name="theme-color" content="#000000" />
      </Head>

      <Component {...pageProps} />
    </>
  );
}

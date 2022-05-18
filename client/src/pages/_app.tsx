import "@styles/globals.css";

import WithNFNovel from "src/contexts/nfnovel-context";

import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WithNFNovel>
      <Component {...pageProps} />;
    </WithNFNovel>
  );
}

export default MyApp;

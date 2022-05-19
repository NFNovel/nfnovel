import "@styles/globals.css";

import WithNFNovel from "src/contexts/nfnovel-context";
import WithPanelData from "src/contexts/panel-context";

import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WithNFNovel>
      <WithPanelData>
        <Component {...pageProps} />;
      </WithPanelData>
    </WithNFNovel>
  );
}

export default MyApp;

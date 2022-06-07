import "@styles/globals.css";

import { WagmiConfig } from "wagmi";
import { useEffect, useState } from "react";
import wagmiClient from "src/config/wagmi";
import WithPanelData from "src/contexts/panel-context";
import ConnectedAccountProvider from "src/contexts/connected-account-context";

import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  // NOTE: fix hydration error with nextjs (force all client-side)
  // THINK: is this the best way to handle this?
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => setIsClientSide(true), []);

  if (!isClientSide) return null;

  return (
    <WagmiConfig client={wagmiClient}>
      <ConnectedAccountProvider>
        <WithPanelData>
          <Component {...pageProps} />;
        </WithPanelData>
      </ConnectedAccountProvider>
    </WagmiConfig>
  );
}

export default MyApp;

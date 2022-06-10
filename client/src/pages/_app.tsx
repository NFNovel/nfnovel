import "@styles/globals.css";

import { WagmiConfig } from "wagmi";
import { useEffect, useState } from "react";
import { ChakraProvider } from "@chakra-ui/react";

import wagmiClient from "src/config/wagmi";
import WithPanelData from "src/contexts/panel-context";
import ConnectedAccountProvider from "src/contexts/connected-account-context";
import Layout from "src/components/layout/Layout";

import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  // NOTE: fix hydration error with nextjs (force all client-side)
  // THINK: is this the best way to handle this?
  const [isClientSide, setIsClientSide] = useState(false);

  useEffect(() => setIsClientSide(true), []);

  if (!isClientSide) return null;

  return (
    <ChakraProvider>
      <WagmiConfig client={wagmiClient}>
        <ConnectedAccountProvider>
          <WithPanelData>
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </WithPanelData>
        </ConnectedAccountProvider>
      </WagmiConfig>
    </ChakraProvider>
  );
}

export default MyApp;

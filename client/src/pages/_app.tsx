import "@styles/globals.css";

import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import WithPanelData from "src/contexts/panel-context";
import ConnectedAccountProvider from "src/contexts/connected-account-context";
import { useEffect, useState } from "react";

import type { AppProps } from "next/app";

const {
  chains,
  provider,
  webSocketProvider
} = configureChains(
  [chain.mainnet, chain.goerli, chain.hardhat],
  [
    jsonRpcProvider({
      rpc: (rpcChain) => {
        // TODO: how to handle mainnet and goerli testnet?

        const localRpcHost = "localhost:8545";

        return {
          http: `http://${localRpcHost}`,
          webSocket: `ws://${localRpcHost}`,
        };
      },
    }),
  ],
);

const wagmiClient = createClient({
  provider,
  webSocketProvider,
  autoConnect: true,
});

function MyApp({ Component, pageProps }: AppProps) {
  // NOTE: fix hydration error with nextjs (force all client-side)
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

import "@styles/globals.css";

import { chain, configureChains, createClient, WagmiConfig } from "wagmi";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import WithNFNovel from "src/contexts/nfnovel-context";
import WithPanelData from "src/contexts/panel-context";

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
  autoConnect: false,
});

import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={wagmiClient}>
      <WithNFNovel>
        <WithPanelData>
          <Component {...pageProps} />;
        </WithPanelData>
      </WithNFNovel>
    </WagmiConfig>
  );
}

export default MyApp;

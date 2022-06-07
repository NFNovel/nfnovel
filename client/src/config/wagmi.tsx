import "@styles/globals.css";

import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import { chain as chains, configureChains, createClient } from "wagmi";

// TODO: whitelist hosted domain [nfnovels, IPFS]
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const { provider, webSocketProvider } = configureChains(
  [chains.mainnet, chains.goerli, chains.hardhat],
  [
    // supports mainnet and goerli testnet
    alchemyProvider({ alchemyId: ALCHEMY_API_KEY }),
    jsonRpcProvider({
      rpc: (rpcChain) => {
        switch (rpcChain.id) {
          case chains.hardhat.id: {
            const localRpcHost = "localhost:8545";

            return {
              http: `http://${localRpcHost}`,
              webSocket: `ws://${localRpcHost}`,
            };
          }

          default:
            return {
              http: rpcChain.rpcUrls.default,
            };
        }
      },
    }),
  ],
);

const wagmiClient = createClient({
  provider,
  webSocketProvider,
  autoConnect: true,
});

export default wagmiClient;

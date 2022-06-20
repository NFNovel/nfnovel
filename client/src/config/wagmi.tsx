import { publicProvider } from "wagmi/providers/public";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import {
  chain as chains,
  ChainProvider,
  configureChains,
  createClient,
} from "wagmi";

const NODE_ENV = process.env.NODE_ENV;

// TODO: whitelist hosted origin(s)
const ALCHEMY_API_KEY = process.env.NEXT_PUBLIC_ALCHEMY_API_KEY;

const supportedChains = NODE_ENV === "production" ?
  [chains.polygonMumbai] :
  [chains.hardhat, chains.localhost];

const providers: ChainProvider[] = [
  alchemyProvider({ alchemyId: ALCHEMY_API_KEY }),
  jsonRpcProvider({
    rpc: (chain) => {
      if (![chains.localhost.id, chains.hardhat.id].includes(chain.id))
        return null;

      return {
        http: "http://localhost:8545",
        webSocket: "ws://localhost:8545",
      };
    },
  }),
  publicProvider(),
];

export const { provider, webSocketProvider } = configureChains(
  supportedChains,
  providers,
);

const wagmiClient = createClient({
  provider,
  webSocketProvider,
  autoConnect: true,
});

export default wagmiClient;

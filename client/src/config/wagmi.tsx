import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { jsonRpcProvider } from "wagmi/providers/jsonRpc";
import {
  Chain,
  chain as chains,
  ChainProvider,
  configureChains,
  createClient,
} from "wagmi";

const NODE_ENV = process.env.NODE_ENV;

// TODO: whitelist hosted origin(s)
const INFURA_API_KEY = process.env.INFURA_API_KEY;
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;

const localChain: Chain = {
  id: 31337,
  name: "local",
  network: "unknown",
  rpcUrls: {
    default: "http://localhost:8545",
    http: "http://localhost:8545",
    webSocket: "ws://localhost:8545",
  },
  nativeCurrency: {
    decimals: 18,
    symbol: "ETH",
    name: "Ether",
  },
};

const supportedChains = NODE_ENV === "production" ?
  [chains.mainnet, chains.goerli] :
  [localChain, chains.goerli];

const providers: ChainProvider[] = [
  jsonRpcProvider({
    rpc: (rpcChain) => {
      if (rpcChain.id !== localChain.id) return null;

      const { http, webSocket } = localChain.rpcUrls;

      return {
        http,
        webSocket,
      };
    },
  }),
  infuraProvider({ infuraId: INFURA_API_KEY }),
  alchemyProvider({ alchemyId: ALCHEMY_API_KEY }),
  publicProvider(),
];

const { provider, webSocketProvider } = configureChains(
  supportedChains,
  providers,
);

const wagmiClient = createClient({
  provider,
  webSocketProvider,
  autoConnect: true,
});

export default wagmiClient;

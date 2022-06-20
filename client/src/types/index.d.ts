export {};

// https://bobbyhadz.com/blog/typescript-property-does-not-exist-on-type-window
declare global {
  interface Window {
    ethereum: any;
  }

  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_ALCHEMY_API_KEY: string;
      NEXT_PUBLIC_NETWORK_CHAIN_ID: string;
      NEXT_PUBLIC_NFNOVEL_CONTRACT_ADDRESS: string;
    }
  }
}

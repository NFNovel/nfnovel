export {};

// https://bobbyhadz.com/blog/typescript-property-does-not-exist-on-type-window
declare global {
  interface Window {
    ethereum: any;
  }

  namespace NodeJS {
    interface ProcessEnv {
      INFURA_API_KEY: string;
      ALCHEMY_API_KEY: string;
      ETHERSCAN_API_KEY: string;
    }
  }
}

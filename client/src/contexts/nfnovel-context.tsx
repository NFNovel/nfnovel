import { ethers, Contract } from "ethers";
import React, { createContext, useState, useEffect } from "react";
import NFNovelDeployment from "@contracts/deployments/NFNovel.json";
import NFNovelContract from "@contracts/NFNovel/NFNovel.sol/NFNovel.json";

import type { Signer } from "ethers";
import type { NFNovel } from "@contracts/types/NFNovel";
import type { Web3Provider } from "@ethersproject/providers";

export interface INFNovelContext {
  nfnovel: NFNovel | null;
  connectedAccount: IConnectedAccount | null;
  metamaskProvider: Web3Provider | null;
  connectContractToSigner: (connectedAccount: IConnectedAccount) => void;
}

export interface IConnectedAccount {
  signer: Signer;
  address: string;
}

export const NFNovelContext = createContext<INFNovelContext>({
  nfnovel: null,
  metamaskProvider: null,
  connectedAccount: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  connectContractToSigner: async (connectedAccount) => {},
});

const WithNFNovel = (props: { children?: React.ReactNode }) => {
  const { children } = props;

  const [nfnovel, setNfnovel] = useState<NFNovel | null>(null);
  const [connectedAccount, setConnectedAccount] = useState<IConnectedAccount | null>(null);
  const [metamaskProvider, setMetamaskProvider] = useState<Web3Provider | null>(
    null,
  );

  const connectContractToSigner = (connectedAccount: IConnectedAccount) => {
    if (!nfnovel) return;

    setConnectedAccount(connectedAccount);
    setNfnovel(nfnovel.connect(connectedAccount.signer));
  };

  useEffect(() => {
    const loadMetamaskProvider = async () => {
      if (!window.ethereum) return;

      const provider = new ethers.providers.Web3Provider(
        window.ethereum,
        NFNovelDeployment.network,
      );

      // TODO: expose nfnovelEvents (connected to websocket provider) for listening to events

      setMetamaskProvider(provider);
      setNfnovel(
        new Contract(
          NFNovelDeployment.contractAddress,
          NFNovelContract.abi,
          provider,
        ) as unknown as NFNovel,
      );
    };

    const loadPreConnectedAccount = async () => {
      if (!metamaskProvider || !nfnovel) return;

      const accounts = await metamaskProvider.send("eth_accounts", []);
      if (accounts.length === 0) return;

      const signer = await metamaskProvider.getSigner();
      const address = await signer.getAddress();

      setConnectedAccount({ signer, address });
      setNfnovel(nfnovel.connect(signer));
    };

    if (!metamaskProvider) loadMetamaskProvider();
    if (!connectedAccount) loadPreConnectedAccount();
  }, [metamaskProvider, nfnovel, connectedAccount]);

  const contextValue: INFNovelContext = {
    nfnovel,
    metamaskProvider,
    connectedAccount,
    connectContractToSigner,
  };

  return (
    <NFNovelContext.Provider value={contextValue}>
      {children}
    </NFNovelContext.Provider>
  );
};

export default WithNFNovel;

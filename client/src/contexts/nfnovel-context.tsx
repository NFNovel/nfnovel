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

  const [connectedAccount, setConnectedAccount] = useState<IConnectedAccount | null>(null);
  const [metamaskProvider, setMetamaskProvider] = useState<Web3Provider | null>(
    null,
  );
  const [nfnovel, setNfnovel] = useState<NFNovel>(
    new Contract(
      NFNovelDeployment.contractAddress,
      NFNovelContract.abi,
    ) as unknown as NFNovel,
  );

  const connectContractToSigner = (connectedAccount: IConnectedAccount) => {
    setConnectedAccount(connectedAccount);
    setNfnovel(nfnovel.connect(connectedAccount.signer));
  };

  useEffect(() => {
    const loadMetamaskProvider = async () => {
      if (!window.ethereum) return;

      const provider = new ethers.providers.Web3Provider(window.ethereum);

      setMetamaskProvider(provider);
      setNfnovel(nfnovel.connect(provider));
    };

    const loadPreConnectedAccount = async () => {
      if (!metamaskProvider) return;

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

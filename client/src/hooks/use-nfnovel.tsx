import { useContract, useProvider } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import NFNovelDeployment from "@evm/deployments/NFNovel.json";
import NFNovelContract from "@evm/contracts/NFNovel/NFNovel.sol/NFNovel.json";
import { NFNovel } from "@evm/types/NFNovel";

import useConnectedAccount from "./use-connected-account";

import type { BigNumberish } from "ethers";
import type { Auction } from "src/types/auction";

// FUTURE: set as input arg to useNFNovel (based on address from NFNovels lookup in routing)
export const nfnovelContractConfig = {
  contractInterface: NFNovelContract.abi,
  addressOrName:
    process.env.NFNOVEL_CONTRACT_ADDRESS || NFNovelDeployment.contractAddress,
};

const useNFNovel = () => {
  const provider = useProvider();
  const { connectedAccount } = useConnectedAccount();

  const [nfnovelSigner, setNfnovelSigner] = useState<NFNovel>(
    useContract<NFNovel>(nfnovelContractConfig),
  );

  const nfnovelReader = useContract<NFNovel>({
    ...nfnovelContractConfig,
    signerOrProvider: provider,
  });

  // NOTE: updates if signer changes
  useEffect(() => {
    const connectSigner = () => {
      if (!connectedAccount?.signer) return;

      setNfnovelSigner((nfnovelSigner) =>
        nfnovelSigner.connect(connectedAccount.signer),
      );
    };

    connectSigner();
  }, [connectedAccount?.signer]);

  const getNovelDetails = useCallback(async () => {
    const title = await nfnovelReader.name();
    const tokenSymbol = await nfnovelReader.symbol();

    return {
      title,
      tokenSymbol,
    };
  }, [nfnovelReader]);

  const getPage = useCallback(
    async (pageNumber: BigNumberish) => {
      try {
        const page = await nfnovelReader.getPage(pageNumber);

        return page;
      } catch {
        return null;
      }
    },
    [nfnovelReader],
  );

  const getPanelTokenUri = useCallback(
    async (panelTokenId: BigNumberish) => {
      try {
        const panelTokenUri = await nfnovelReader.tokenURI(panelTokenId);

        return panelTokenUri;
      } catch {
        return null;
      }
    },
    [nfnovelReader],
  );

  const isPanelSold = useCallback(
    async (panelTokenId: BigNumberish) => {
      try {
        await nfnovelReader.ownerOf(panelTokenId);

        return true;
      } catch {
        return false;
      }
    },
    [nfnovelReader],
  );

  const getPanelAuctionId = useCallback(
    async (panelTokenId: BigNumberish) =>
      nfnovelReader.getPanelAuctionId(panelTokenId),
    [nfnovelReader],
  );

  return {
    nfnovelReader,
    nfnovelSigner,
    hasSigner: !!nfnovelSigner.signer,
    getPage,
    isPanelSold,
    getNovelDetails,
    getPanelTokenUri,
    getPanelAuctionId,
    nfnovelContractConfig,
  };
};

export default useNFNovel;

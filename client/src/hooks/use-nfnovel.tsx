import { useContract, useProvider } from "wagmi";
import { useCallback, useEffect, useState } from "react";
import NFNovelDeployment from "@evm/deployments/NFNovel.json";
import NFNovelContract from "@evm/contracts/NFNovel/NFNovel.sol/NFNovel.json";

import type { NFNovel } from "@evm/types/NFNovel";

import useConnectedAccount from "./use-connected-account";

import type { BigNumberish } from "ethers";
import type { Auction } from "src/types/auction";

export const nfnovelContractConfig = {
  contractInterface: NFNovelContract.abi,
  addressOrName:
    process.env.NFNOVEL_CONTRACT_ADDRESS || NFNovelDeployment.contractAddress,
};

const useNFNovel = () => {
  const provider = useProvider();
  const { connectedAccount } = useConnectedAccount();

  const [nfnovel, setNfnovel] = useState<NFNovel>(
    useContract<NFNovel>({
      ...nfnovelContractConfig,
      signerOrProvider: provider,
    }),
  );

  useEffect(() => {
    const connectSigner = () => {
      if (!connectedAccount?.signer) return;

      setNfnovel((nfnovel) => nfnovel.connect(connectedAccount.signer));
    };

    connectSigner();
    // NOTE: will update if connected account changes
  }, [connectedAccount]);

  // TODO: expose other calls like this
  // THINK: have a loading state too?
  const getAuction = useCallback(
    (auctionId: BigNumberish, setAuction: (auction: Auction) => void) =>
      nfnovel.auctions(auctionId).then(setAuction),
    [nfnovel],
  );

  const getNovelDetails = useCallback(async () => {
    const title = await nfnovel.name();
    const tokenSymbol = await nfnovel.symbol();

    return {
      title,
      tokenSymbol,
    };
  }, [nfnovel]);

  const getPage = useCallback(
    async (pageNumber: BigNumberish) => {
      try {
        const page = await nfnovel.getPage(pageNumber);

        return page;
      } catch {
        return null;
      }
    },
    [nfnovel],
  );

  return {
    nfnovel,
    getPage,
    getAuction,
    getNovelDetails,
    nfnovelContractConfig,
    hasSigner: !!nfnovel.signer,
  };
};

export default useNFNovel;

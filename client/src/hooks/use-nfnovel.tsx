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
  const loadAuction = useCallback(
    (auctionId: BigNumberish, setAuction: (auction: Auction) => void) =>
      nfnovel.auctions(auctionId).then(setAuction),
    [nfnovel],
  );

  return {
    nfnovel,
    loadAuction,
    nfnovelContractConfig,
    hasSigner: !!nfnovel.signer,
  };
};

export default useNFNovel;

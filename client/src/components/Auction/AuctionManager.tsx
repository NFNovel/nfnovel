import { BigNumber } from "ethers";
import { useContractEvent } from "wagmi";
import { Spinner } from "@blueprintjs/core";
import { useCallback, useEffect, useState } from "react";

import Auction from "./Auction";
import { buildAuctionFilters } from "./utils";
import useAuctionable from "./use-auctionable";

import type { Auction as AuctionType } from "src/types/auction";
import type { Auctionable } from "@evm/types/Auctionable";
import type { IERC721TokenMetadata } from "src/types/token";
import type { ContractInterface } from "ethers";
import type { IConnectedAccount } from "src/contexts/connected-account-context";

// TODO: clean up this file (types, utils etc)

export type AuctionableTokenData = {
  imageSource: string;
  tokenId: BigNumber | number;
  metadata: IERC721TokenMetadata;
};

type AuctionManagerProps = {
  connectedAccount: IConnectedAccount | null;
  auctionableContract: Auctionable;
  /** WAGMI compatible Contract config for events */
  auctionableContractConfig: {
    addressOrName: string;
    contractInterface: ContractInterface;
  };
  auctionId: BigNumber | number;
  tokenData: AuctionableTokenData;
  onTransferToken: () => Promise<boolean>;
};

// THINK: how to manage locking UI while waiting for event confirmation?
// THINK: how to indicate success/failure?
const AuctionManager = (props: AuctionManagerProps) => {
  const {
    auctionId,
    tokenData,
    onTransferToken,
    connectedAccount,
    auctionableContract,
    auctionableContractConfig,
  } = props;

  const {
    auction,
    handleAddToBid,
    handleWithdrawBid,
    transactionPending,
    currentConnectedAccountBid,
  } = useAuctionable({
    auctionId,
    auctionableContract,
    auctionableContractConfig,
    connectedAccountAddress: connectedAccount?.address,
  });

  if (!auction) return <Spinner />;

  return (
    <Auction
      auction={auction}
      currentBid={currentConnectedAccountBid}
      onAddToBid={handleAddToBid}
      onWithdrawBid={handleWithdrawBid}
      // REMOVE: not responsibility of auction
      onMintPanel={onTransferToken}
      // transactionPending={transactionPending}
      {...tokenData}
    />
  );
};

export default AuctionManager;

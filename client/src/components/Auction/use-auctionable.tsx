import { BigNumber } from "ethers";
import { useContractEvent } from "wagmi";
import { useState, useEffect, useCallback } from "react";

import { buildAuctionFilters } from "./utils";

import type { ContractInterface } from "ethers";
import type { Auctionable } from "@evm/types/Auctionable";
import type { Auction as AuctionType } from "src/types/auction";

export interface IUseAuctionConfig {
  auctionableContract: Auctionable;
  connectedAccountAddress: string | undefined | null;
  /** WAGMI compatible Contract config for events */
  auctionableContractConfig: {
    addressOrName: string;
    contractInterface: ContractInterface;
  };
  auctionId: BigNumber | number;
}

const useAuctionable = (config: IUseAuctionConfig) => {
  const {
    auctionId,
    connectedAccountAddress,
    auctionableContract,
    auctionableContractConfig,
  } = config;

  const [auction, setAuction] = useState<AuctionType>();

  const [transactionPending, setTransactionPending] = useState(false);

  const [currentConnectedAccountBid, setCurrentConnectedAccountBid] = useState(
    BigNumber.from(0),
  );

  /**
   * EFFECTS
   */

  useEffect(() => {
    const loadAuction = async () => {
      if (auction) return;
      // only load the auction once, afterwards it will be kept in sync with event listeners
      setAuction(await auctionableContract.auctions(auctionId));
    };

    loadAuction();
  }, [auction, auctionableContract, auctionId]);

  useEffect(() => {
    const loadCurrentBid = async () => {
      if (!auctionableContract.signer) {
        console.error(
          "auctionable contract does not have a signer to load their current bid",
        );

        return;
      }

      setCurrentConnectedAccountBid(
        await auctionableContract.checkBid(auctionId),
      );
    };

    loadCurrentBid();
    // NOTE: will reload currentBid if connectedAccountAddress changes (causing contract to update)
  }, [auctionId, auctionableContract]);

  /**
   * END EFFECTS
   */

  /**
   * HANDLERS
   */

  // THINK: ref to useAddToBid(auctionableContract, auctionId) => { addToBid: (amountInWei) => boolean, isWaitingForConfirmation, ... }
  const handleAddToBid = useCallback(
    async (amountInWei: BigNumber) => {
      if (!auctionableContract.signer) {
        console.error(
          "auctionable contract does not have a signer to add to their bid",
        );

        return false;
      }

      try {
        setTransactionPending(true);
        await auctionableContract.addToBid(auctionId, { value: amountInWei });

        return true;
      } catch (error: any) {
        console.error("addToBid failed", {
          auctionId,
          error: error,
        });

        return false;
      } finally {
        setTransactionPending(false);
      }
    },
    [auctionId, auctionableContract],
  );

  const handleWithdrawBid = useCallback(async () => {
    if (!auctionableContract.signer) {
      console.error(
        "auctionable contract does not have a signer to withdraw their bid",
      );

      return false;
    }

    try {
      setTransactionPending(true);
      await auctionableContract.withdrawBid(auctionId);

      return true;
    } catch (error: any) {
      console.error("withdrawBid failed", {
        auctionId,
        error: error,
      });

      return false;
    } finally {
      setTransactionPending(false);
    }
  }, [auctionId, auctionableContract]);

  /**
   * END HANDLERS
   */

  /**
   * EVENT LISTENERS
   */

  const {
    filterAuctionEnded,
    filterAuctionBidRaised,
    filterAuctionBidWithdrawn,
  } = buildAuctionFilters(auctionableContract, auctionId);

  useContractEvent(
    auctionableContractConfig,
    filterAuctionEnded,
    () =>
      setAuction((currentAuction) =>
        Object.assign({}, currentAuction, { state: 2 }),
      ),
    { once: true },
  );

  const handleAuctionBidRaised = useCallback(
    // NOTE: bug https://github.com/tmm/wagmi/issues/529
    // causes all event args to show up as single array
    // (auctionId: BigNumber, highestBidder: string, highestBid: BigNumber) => {
    (eventArgs: unknown[]) => {
      const [auctionId, highestBidder, highestBid, event] = eventArgs;
      if (connectedAccountAddress === highestBidder) {
        setCurrentConnectedAccountBid(highestBid as BigNumber);
      }

      console.log("auction bid raised", {
        auctionId,
        highestBidder,
        highestBid,
      });

      setAuction((currentAuction) =>
        Object.assign({}, currentAuction, { highestBid, highestBidder }),
      );
    },
    // NOTE: current bid is relative to the connected account (which can change)
    // useCallback with dep on connected account to always sync currentConnectedAccountBid with correct account
    [connectedAccountAddress],
  );

  useContractEvent(
    auctionableContractConfig,
    filterAuctionBidRaised,
    handleAuctionBidRaised,
  );

  const handleAuctionBidWithdrawn = useCallback(
    // NOTE: bug https://github.com/tmm/wagmi/issues/529
    // causes all event args to show up as single array
    // (auctionId: BigNumber, highestBidder: string, highestBid: BigNumber) => {
    (eventArgs: unknown[]) => {
      const [auctionId, withdrawnBidder, withdrawnBid, event] = eventArgs;
      if (connectedAccountAddress === withdrawnBidder) {
        setCurrentConnectedAccountBid(BigNumber.from(0));
      }
    },
    // NOTE: see note above
    [connectedAccountAddress],
  );

  useContractEvent(
    auctionableContractConfig,
    filterAuctionBidWithdrawn,
    handleAuctionBidWithdrawn,
  );

  /**
   * END EVENT LISTENERS
   */

  return {
    auction,
    handleAddToBid,
    handleWithdrawBid,
    transactionPending,
    currentConnectedAccountBid,
  };
};

export default useAuctionable;

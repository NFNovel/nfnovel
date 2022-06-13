import { BigNumber } from "ethers";
import { useContractEvent } from "wagmi";
import { useState, useEffect, useCallback } from "react";
import { DateTime, Duration } from "luxon";

import type { Auctionable } from "@evm/types/Auctionable";

import { useInterval } from "src/utils/use-timers";

import { buildAuctionFilters } from "./utils";

import type { ContractInterface } from "ethers";
import type { Auction as AuctionType } from "src/types/auction";

export interface IUseAuctionableConfig {
  auctionId: BigNumber | number;
  auctionableContract: Auctionable;
  connectedAccountAddress: string | undefined | null;
  onAuctionEnded?: (endedAuction: AuctionType) => void;
}

export interface IUseAuctionable {
  currentBid: BigNumber;
  transactionPending: boolean;
  isActive: boolean | undefined;
  timeRemaining: Duration | null;
  auction: AuctionType | undefined;
  onWithdrawBid: () => Promise<boolean>;
  onAddToBid: (amountInWei: BigNumber) => Promise<boolean>;
}

export const computeTimeRemaining = (auction: AuctionType) => {
  const remainingTime = DateTime.fromSeconds(
    auction.endTime.toNumber(),
  ).diffNow(["seconds", "hours", "minutes"]);

  return remainingTime.toMillis() <= 0 ? Duration.fromMillis(0) : remainingTime;
};

// THINK: add onWithdrawableBid hook (to indicate to user that they have a bid to withdraw)
const useAuctionable = (config: IUseAuctionableConfig): IUseAuctionable => {
  const {
    auctionId,
    onAuctionEnded,
    auctionableContract,
    connectedAccountAddress,
  } = config;

  /** WAGMI compatible Contract config for events */
  const auctionableContractConfig = {
    addressOrName: auctionableContract.address,
    contractInterface: auctionableContract.interface,
  };

  const [isActive, setIsActive] = useState<boolean>();
  const [auction, setAuction] = useState<AuctionType>();
  const [transactionPending, setTransactionPending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<Duration | null>(null);
  const [currentConnectedAccountBid, setCurrentConnectedAccountBid] = useState(
    BigNumber.from(0),
  );

  // recalculates remaining time every second until auction is no longer active
  useInterval(
    () => {
      if (!auction) return;

      const _timeRemaining = computeTimeRemaining(auction);

      setTimeRemaining(_timeRemaining);
    },
    isActive ? 1000 : null,
  );

  /**
   * EFFECTS
   */

  useEffect(() => {
    const loadAuction = async () => {
      const auction = await auctionableContract.auctions(auctionId);
      // only load the auction once, afterwards it will be kept in sync with event listeners
      setAuction(auction);

      // if auction is ended report on load
      if (auction.state === 2) {
        setIsActive(false);
        onAuctionEnded && onAuctionEnded(auction);

        return;
      }

      const remainingTime = computeTimeRemaining(auction);
      if (remainingTime.toMillis() > 0) {
        setIsActive(true);
        setTimeRemaining(remainingTime);
      } else {
        setIsActive(false);
      }
    };

    if (!auction) loadAuction();
  }, [auction, auctionableContract, auctionId, onAuctionEnded]);

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

  // NOTE: reset time remaining so it doesnt "jump" if unmounted
  useEffect(() => {
    return () => {
      setTimeRemaining(null);
    };
  }, []);

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

  const handleAuctionEnded = useCallback(() => {
    const endedAuction = Object.assign({}, auction, { state: 2 });

    setIsActive(false);
    setAuction(endedAuction);

    // callback hook for parent component to get final auction when ended
    onAuctionEnded && onAuctionEnded(endedAuction);
  }, [auction, onAuctionEnded]);

  useContractEvent(
    auctionableContractConfig,
    filterAuctionEnded,
    handleAuctionEnded,
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
    isActive,
    auction,
    timeRemaining,
    transactionPending,
    onAddToBid: handleAddToBid,
    onWithdrawBid: handleWithdrawBid,
    currentBid: currentConnectedAccountBid,
  };
};

export default useAuctionable;

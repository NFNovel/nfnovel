import { BigNumber } from "ethers";
import { useContractEvent } from "wagmi";
import { useState, useEffect, useCallback } from "react";
import { DateTime, Duration } from "luxon";

import type { Auctionable } from "@evm/types/Auctionable";

import { useInterval } from "src/utils/use-timers";

import { buildAuctionFilters, extractCustomEVMError } from "./utils";

import type { Auction as AuctionType } from "src/types/auction";

export interface IUseAuctionableConfig {
  auctionId: BigNumber | number;
  auctionableReader: Auctionable;
  auctionableSigner: Auctionable;
  connectedAccountAddress: string | undefined | null;
  onAuctionEnded?: (endedAuction: AuctionType) => void;
}

export type TransactionRequestResult = {
  success: boolean;
  error: string | null;
};

export interface IUseAuctionable {
  currentBid: BigNumber;
  transactionPending: boolean;
  isActive: boolean | undefined;
  timeRemaining: Duration;
  auction: AuctionType | undefined;
  onWithdrawBid: () => Promise<TransactionRequestResult>;
  onAddToBid: (amountInWei: BigNumber) => Promise<TransactionRequestResult>;
}

const computeTimeRemaining = (auction: AuctionType) => {
  const remainingTime = DateTime.fromSeconds(
    auction.endTime.toNumber(),
  ).diffNow(["seconds", "hours", "minutes"]);

  return remainingTime.toMillis() <= 0 ? Duration.fromMillis(0) : remainingTime;
};

const computeTimeRemainingInterval = (auction: AuctionType) => {
  const oneSecond = 1 * 1000;
  const oneMinute = 60 * 1000;
  const timeRemaining = computeTimeRemaining(auction).toMillis();

  if (timeRemaining <= 0) return null;

  // switch to 1 second intervals when under 2 mins remaining
  return timeRemaining >= oneMinute * 2 ? oneMinute : oneSecond;
};

// THINK: add onWithdrawableBid hook (to indicate to user that they have a bid to withdraw)
const useAuctionable = (config: IUseAuctionableConfig): IUseAuctionable => {
  const {
    auctionId,
    onAuctionEnded,
    auctionableReader,
    auctionableSigner,
    connectedAccountAddress,
  } = config;

  /** WAGMI compatible Contract config for events */
  const auctionableContractConfig = {
    addressOrName: auctionableReader.address,
    contractInterface: auctionableReader.interface,
  };

  const [isActive, setIsActive] = useState<boolean>();
  const [auction, setAuction] = useState<AuctionType>();
  const [transactionPending, setTransactionPending] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<Duration>(
    Duration.fromMillis(0),
  );
  const [currentConnectedAccountBid, setCurrentConnectedAccountBid] = useState(
    BigNumber.from(0),
  );

  // recalculates remaining time every second until auction is no longer active
  useInterval(
    () => {
      if (!auction) return;

      const timeRemaining = computeTimeRemaining(auction);

      setTimeRemaining(timeRemaining);
    },
    // NOTE: variable interval - only go down to seconds when < 2 min
    auction ? computeTimeRemainingInterval(auction) : null,
  );

  /**
   * EFFECTS
   */

  useEffect(() => {
    const loadAuction = async () => {
      const auction = await auctionableReader.auctions(auctionId);
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
        onAuctionEnded && onAuctionEnded(auction);
      }
    };

    loadAuction();
  }, [auctionableReader, auctionId, onAuctionEnded]);

  useEffect(() => {
    const loadCurrentBid = async () => {
      if (!auctionableSigner.signer) {
        console.error(
          "auctionable contract does not have a signer to load their current bid",
        );

        return;
      }

      setCurrentConnectedAccountBid(
        await auctionableSigner.checkBid(auctionId),
      );
    };

    loadCurrentBid();
    // NOTE: will reload currentBid if connectedAccountAddress changes (causing contract to update)
  }, [auctionId, auctionableSigner]);

  // NOTE: reset time remaining so it doesnt "jump" if unmounted
  useEffect(() => {
    return () => {
      setTimeRemaining(Duration.fromMillis(0));
    };
  }, []);

  /**
   * END EFFECTS
   */

  /**
   * HANDLERS
   */

  const handleAddToBid = useCallback(
    async (amountInWei: BigNumber) => {
      if (!auctionableSigner.signer) {
        console.error(
          "auctionable contract does not have a signer to add to their bid",
        );

        return { success: false, error: "Account not connected" };
      }

      try {
        setTransactionPending(true);
        await auctionableSigner.addToBid(auctionId, { value: amountInWei });

        return { success: true, error: null };
      } catch (error: any) {
        const customError = extractCustomEVMError(error);

        console.error("addToBid failed", {
          auctionId,
          error: customError || error,
        });

        return { success: false, error: customError || "Unknown error" };
      } finally {
        setTransactionPending(false);
      }
    },
    [auctionId, auctionableSigner],
  );

  const handleWithdrawBid = useCallback(async () => {
    if (!auctionableSigner.signer) {
      console.error(
        "auctionable contract does not have a signer to withdraw their bid",
      );

      return { success: false, error: "Account not connected" };
    }

    try {
      setTransactionPending(true);
      await auctionableSigner.withdrawBid(auctionId);

      return { success: true, error: null };
    } catch (error: any) {
      const customError = extractCustomEVMError(error);

      console.error("withdrawBid failed", {
        auctionId,
        error: customError || error,
      });

      return { success: false, error: customError || "Unknown error" };
    } finally {
      setTransactionPending(false);
    }
  }, [auctionId, auctionableSigner]);

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
  } = buildAuctionFilters(auctionableReader, auctionId);

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

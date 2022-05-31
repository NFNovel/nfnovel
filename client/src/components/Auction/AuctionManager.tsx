import { BigNumber } from "ethers";
import { useContractEvent } from "wagmi";
import { Spinner } from "@blueprintjs/core";
import { useCallback, useEffect, useState } from "react";

import Auction from "./Auction";
import { buildAuctionFilters } from "./utils";

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
};

// THINK: how to manage locking UI while waiting for event confirmation?
// THINK: how to indicate success/failure?
const AuctionManager = (props: AuctionManagerProps) => {
  const {
    auctionId,
    tokenData,
    connectedAccount,
    auctionableContract,
    auctionableContractConfig,
  } = props;

  const [auction, setAuction] = useState<AuctionType>();
  // TODO: pass down to children to lock UI while waiting for event update
  const [waitForConfirmation, setWaitForConfirmation] = useState(false);
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
      if (!auctionableContract.signer) return;

      setCurrentConnectedAccountBid(
        await auctionableContract.checkBid(auctionId),
      );
    };

    loadCurrentBid();
    // NOTE: will reload currentBid if connectedAccount changes (causing contract to update)
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
      try {
        setWaitForConfirmation(true);
        await auctionableContract.addToBid(auctionId, { value: amountInWei });

        return true;
      } catch (error: any) {
        console.error("addToBid failed", {
          auctionId,
          error: error,
        });

        return false;
      } finally {
        setWaitForConfirmation(false);
      }
    },
    [auctionId, auctionableContract],
  );

  const handleWithdrawBid = useCallback(async () => {
    try {
      setWaitForConfirmation(true);
      await auctionableContract.withdrawBid(auctionId);

      return true;
    } catch (error: any) {
      console.error("withdrawBid failed", {
        auctionId,
        error: error,
      });

      return false;
    } finally {
      setWaitForConfirmation(false);
    }
  }, [auctionId, auctionableContract]);

  // REMOVE: not responsibility of auction
  const handleMintToken = async () => {
    console.log("mint token called");

    return true;
  };

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
      if (connectedAccount?.address === highestBidder) {
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
    [connectedAccount],
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
      if (connectedAccount?.address === withdrawnBidder) {
        setCurrentConnectedAccountBid(BigNumber.from(0));
      }
    },
    // NOTE: see note above
    [connectedAccount],
  );

  useContractEvent(
    auctionableContractConfig,
    filterAuctionBidWithdrawn,
    handleAuctionBidWithdrawn,
  );

  /**
   * END EVENT LISTENERS
   */

  if (!auction) return <Spinner />;

  return (
    <Auction
      auction={auction}
      currentBid={currentConnectedAccountBid}
      onAddToBid={handleAddToBid}
      onWithdrawBid={handleWithdrawBid}
      // REMOVE: not responsibility of auction
      onMintPanel={handleMintToken}
      {...tokenData}
    />
  );
};

export default AuctionManager;

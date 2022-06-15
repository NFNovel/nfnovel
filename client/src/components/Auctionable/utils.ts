import { BigNumber, ethers } from "ethers";

import type { Auctionable } from "@evm/types/Auctionable";

import type { BigNumberish, EventFilter } from "ethers";

type HandledAuctionableEvent =
  | "AuctionBidRaised"
  | "AuctionBidWithdrawn"
  | "AuctionEnded";

type AuctionableEventFilters = {
  [filter in `filter${HandledAuctionableEvent}`]: EventFilter;
};

/**
 * filters on Auctionable events for current auction (by auctionId)
 * @param auctionableContract
 * @param auctionId
 * @returns
 */
export const buildAuctionFilters = (
  auctionableContract: Auctionable,
  auctionId: BigNumberish,
): AuctionableEventFilters => ({
  filterAuctionBidRaised:
    auctionableContract.filters.AuctionBidRaised(auctionId),
  filterAuctionBidWithdrawn:
    auctionableContract.filters.AuctionBidWithdrawn(auctionId),
  filterAuctionEnded: auctionableContract.filters.AuctionEnded(auctionId),
});

export const convertToEth = (amountInWei: BigNumberish, withCurrency = false) =>
  `${ethers.utils.formatEther(amountInWei)}${withCurrency ? " Ξ" : ""}`;

export const convertToWei = (amountInEth: string): BigNumber =>
  ethers.utils.parseEther(amountInEth);

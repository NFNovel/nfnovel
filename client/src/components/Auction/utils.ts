import type { Auctionable } from "@evm/types/Auctionable";
import type { BigNumber, EventFilter } from "ethers";

type HandledAuctionableEvent =
  | "AuctionBidRaised"
  | "AuctionBidWithdrawn"
  | "AuctionEnded";

type AuctionableEventFilters = {
  [filter in `filter${HandledAuctionableEvent}`]: EventFilter;
};

export const buildAuctionFilters = (
  auctionableContract: Auctionable,
  auctionId: BigNumber | number,
): AuctionableEventFilters => ({
  filterAuctionBidRaised:
    auctionableContract.filters.AuctionBidRaised(auctionId),
  filterAuctionBidWithdrawn:
    auctionableContract.filters.AuctionBidWithdrawn(auctionId),
  filterAuctionEnded: auctionableContract.filters.AuctionEnded(auctionId),
});

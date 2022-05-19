import type { BigNumber } from "ethers";

export type Auction = {
  state: AuctionStates;
  /** panelAuctionId */
  id: BigNumber;
  /** panelTokenId */
  tokenId: BigNumber;
  /** Unix timestamp in seconds */
  startTime: BigNumber;
  /** Unix timestamp in seconds */
  endTime: BigNumber;
  /** in wei */
  startingValue: BigNumber;
  /** in wei */
  minimumBidValue: BigNumber;
  /** in wei */
  highestBid: BigNumber;
  highestBidder: string;
};

export type AuctionSettings = {
  /** seconds */
  duration: BigNumber;
  startingValue: BigNumber;
  minimumBidValue: BigNumber;
};

export enum AuctionStates {
  /** 0 */
  Pending,
  /** 1 */
  Active,
  /** 2 */
  Ended,
  /** 3 */
  Cancelled,
}

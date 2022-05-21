/* eslint-disable @next/next/no-img-element */
import { useContext } from "react";
import { BigNumber, ethers } from "ethers";
import { Drawer, Position } from "@blueprintjs/core";
import { NFNovelContext } from "src/contexts/nfnovel-context";

import BiddingForm from "./BiddingForm";
import RemainingTime from "./RemainingTime";

import type { Auction } from "src/types/auction";
import type { IERC721TokenMetadata } from "src/types/token";

export type AuctionModalProps = {
  isOpen: boolean;
  auction: Auction;
  imageSource: string;
  hasConnectedAccount: boolean;
  metadata: IERC721TokenMetadata;
  onAddToBid: (amountInWei: BigNumber) => Promise<boolean>;
  onWithdrawBid: (amountInWei: BigNumber) => Promise<boolean>;
  onClose: () => void;
  getCurrentBid: () => Promise<BigNumber>;
};

function AuctionModal(props: AuctionModalProps) {
  const {
    isOpen,
    auction,
    metadata, // THINK: any use for metadata?
    imageSource,
    onClose,
    onAddToBid,
    onWithdrawBid,
    getCurrentBid,
  } = props;

  const { connectedAccount } = useContext(NFNovelContext);

  if (!auction) return null;

  const highestBidderMessage = auction.highestBidder === connectedAccount?.address ?
    "You are the highest bidder!" :
    `Highest bidder: ${auction.highestBidder}`;

  return (
    <Drawer
      isOpen={isOpen}
      title="Place your Bid for this Panel"
      icon="info-sign"
      position={Position.BOTTOM}
      canEscapeKeyClose={true}
      canOutsideClickClose={true}
      enforceFocus={true}
      autoFocus={true}
      onClose={onClose}
      usePortal={true}
      hasBackdrop={true}
    >
      <div className="flex flex-row">
        <img
          src={imageSource}
          className="border border-indigo-600 h-80"
        />
        <div className="flex flex-wrap flex-col">
          <div className="p-5">
            Highest bid: {ethers.utils.formatEther(auction.highestBid)} ETH
          </div>
          <div className="p-5">{highestBidderMessage}</div>
          <BiddingForm
            auction={auction}
            onAddToBid={onAddToBid}
            onWithdrawBid={onWithdrawBid}
            getCurrentBid={getCurrentBid}
          />
        </div>
        <RemainingTime
          auction={auction}
          isOpen={isOpen}
        />
      </div>
    </Drawer>
  );
}

export default AuctionModal;

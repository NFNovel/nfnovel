/* eslint-disable @next/next/no-img-element */
import { useContext, useState } from "react";
import { BigNumber, ethers } from "ethers";
import { Button, Drawer, Position } from "@blueprintjs/core";
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
  onClose: () => void;
  getCurrentBid: () => Promise<BigNumber>;
  onWithdrawBid: () => Promise<boolean>;
  onMintPanel: () => Promise<boolean>;
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
    onMintPanel,
  } = props;

  const { connectedAccount } = useContext(NFNovelContext);

  if (!auction) return null;

  const highestBidderMessage = auction.highestBidder === connectedAccount?.address ?
    "You are the highest bidder!" :
    auction.highestBidder === ethers.constants.AddressZero ?
      `No bidders yet` :
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
      {" "}
      <div className="flex flex-row">
        <img
          src={imageSource}
          className="border border-indigo-600 h-80"
        />
        {auction.state === 1 && (
          <>
            <div className="flex flex-wrap flex-col">
              <div className="p-5">
                {auction.highestBidder === ethers.constants.AddressZero ?
                  "Starting bid: " :
                  "Highest bid: "}{" "}
                {ethers.utils.formatEther(auction.highestBid)} ETH
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
          </>
        )}
        {auction.state === 2 && (
          //TODO: This is not fully working and logic needs to be finished.
          <div className="flex flex-col p-10">
            {auction.highestBidder === connectedAccount?.address ?
              "You are the winner! Mint the panel" :
              "Sorry you didn't win, get your funds back"}
            <Button
              className="h-20"
              text={
                auction.highestBidder === connectedAccount?.address ?
                  "Mint Panel" :
                  "Withdraw Funds"
              }
              onClick={
                auction.highestBidder === connectedAccount?.address ?
                  onMintPanel :
                  onWithdrawBid
              }
            />
          </div>
        )}
      </div>
    </Drawer>
  );
}

export default AuctionModal;

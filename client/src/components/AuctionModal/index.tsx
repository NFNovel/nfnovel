/* eslint-disable @next/next/no-img-element */
import { useContext, useEffect, useState } from "react";
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
  const [mintSuccessful, setMintSuccessul] = useState<boolean>();
  const [finalWithdrawValueWei, setFinalWithdrawValueWei] = useState<BigNumber>(
    BigNumber.from(0),
  );

  const handleMintPanel = async () => {
    const success = await onMintPanel();
    setMintSuccessul(success);
  };

  useEffect(() => {
    const getFinalWithdrawValue = async () => {
      const finalBidValueWei = await getCurrentBid();
      setFinalWithdrawValueWei(finalBidValueWei);
    };

    if (auction.state == 2) getFinalWithdrawValue();
  }, [auction, getCurrentBid]);

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
                  `Withdraw ${ethers.utils.formatEther(
                    finalWithdrawValueWei,
                  )} ETH`
              }
              disabled={!finalWithdrawValueWei.gt(0)}
              onClick={
                auction.highestBidder === connectedAccount?.address ?
                  handleMintPanel :
                  onWithdrawBid
              }
            />
          </div>
        )}
        {/* TODO: do something similar for bid being successful
        ideally use toasters to present the info */}
        {mintSuccessful === true &&
          `Successfully minted panel ${auction.tokenId.toString()}!`}
        {mintSuccessful === false && "Failed to mint panel"}
      </div>
    </Drawer>
  );
}

export default AuctionModal;

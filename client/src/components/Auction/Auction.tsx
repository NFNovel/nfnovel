/* eslint-disable @next/next/no-img-element */
import { useState } from "react";
import { BigNumber, ethers } from "ethers";
import { Button } from "@blueprintjs/core";
import useConnectedAccount from "src/hooks/use-connected-account";

import BiddingForm from "./BiddingForm";
import RemainingTime from "./RemainingTime";

import type { IERC721TokenMetadata } from "src/types/token";
import type { Auction as AuctionType } from "src/types/auction";

export type AuctionModalProps = {
  auction: AuctionType;
  currentBid: BigNumber;
  imageSource: string;
  metadata: IERC721TokenMetadata;
  onAddToBid: (amountInWei: BigNumber) => Promise<boolean>;
  onWithdrawBid: () => Promise<boolean>;
  onMintPanel: () => Promise<boolean>;
};

function Auction(props: AuctionModalProps) {
  const {
    auction,
    currentBid,
    metadata, // THINK: any use for metadata?
    imageSource,
    onAddToBid,
    onWithdrawBid,
    onMintPanel,
  } = props;

  const { connectedAccount } = useConnectedAccount();
  const [mintSuccessful, setMintSuccessul] = useState<boolean>();
  const [withdrawSuccessful, setWithdrawSuccessful] = useState<boolean>();

  const handleMintPanel = async () => {
    const success = await onMintPanel();
    setMintSuccessul(success);
  };

  const handleWithdrawBid = async () => {
    const success = await onWithdrawBid();
    setWithdrawSuccessful(success);
  };

  const highestBidderMessage = auction.highestBidder === connectedAccount?.address ?
    "You are the highest bidder!" :
    auction.highestBidder === ethers.constants.AddressZero ?
      `No bidders yet` :
      `Highest bidder: ${auction.highestBidder}`;

  return (
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
              currentBid={currentBid}
            />
          </div>
          <RemainingTime auction={auction} />
        </>
      )}
      {auction.state === 2 && (
        //TODO: This is not fully working and logic needs to be finished.
        <div className="flex flex-col p-10">
          {}
          {auction.highestBidder === connectedAccount?.address && (
            <>
              <Button
                className="h-20"
                text={"Mint Panel"}
                disabled={mintSuccessful !== undefined}
                onClick={handleMintPanel}
              />
              {mintSuccessful === true &&
                `Successfully minted panel ${auction.tokenId.toString()} for ${ethers.utils.formatEther(
                  auction.highestBid,
                )} ETH!`}
              {mintSuccessful === false && "Failed to mint panel"}
            </>
          )}
          {auction.highestBidder !== connectedAccount?.address && (
            <>
              <Button
                className="h-20"
                text={
                  currentBid.isZero() ?
                    "Nothing to withdraw" :
                    `Withdraw ${ethers.utils.formatEther(currentBid)} ETH`
                }
                disabled={withdrawSuccessful !== undefined}
                onClick={handleWithdrawBid}
              />
              {withdrawSuccessful === true &&
                !currentBid.isZero() &&
                `Successfully withdrew ${ethers.utils.formatEther(
                  currentBid,
                )} ETH!`}
              {withdrawSuccessful === false && "Failed to withdraw"}
            </>
          )}
        </div>
      )}
    </div>
  );
}

export default Auction;
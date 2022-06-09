import { ethers } from "ethers";
import { Spinner } from "@chakra-ui/react";

import useAuctionable, { IUseAuctionableConfig } from "./use-auctionable";
import BiddingForm, { WithdrawBidButton } from "./BiddingForm";
import RemainingTime from "./RemainingTime";
import { amountInEthText } from "./utils";

import type { BigNumberish } from "ethers";
import type { IERC721TokenMetadata } from "src/types/token";

export type AuctionableTokenDetails = {
  imageSource: string;
  tokenId: BigNumberish;
  metadata: IERC721TokenMetadata;
};

export type AuctionProps = IUseAuctionableConfig & {
  token: AuctionableTokenDetails;
  ClaimTokenButton: () => JSX.Element;
};

const Auction = (props: AuctionProps) => {
  const {
    token,
    auctionId,
    onAuctionEnded,
    ClaimTokenButton,
    auctionableContract,
    connectedAccountAddress,
  } = props;

  const {
    auction,
    isActive,
    currentBid,
    onAddToBid,
    onWithdrawBid,
    timeRemaining,
    transactionPending,
  } = useAuctionable({
    auctionId,
    onAuctionEnded,
    connectedAccountAddress,
    auctionableContract,
  });

  if (!auction) return <Spinner />;

  const isHighestBidder = auction.highestBidder === connectedAccountAddress;
  const shouldDisplayWithdrawButton = auction.highestBidder !== connectedAccountAddress;
  const shouldDisplayClaimButton = !isActive && connectedAccountAddress && isHighestBidder;

  const highestBidderMessage = isHighestBidder ?
    "You are the highest bidder!" :
    auction.highestBidder === ethers.constants.AddressZero ?
      `No bidders yet` :
      `Highest bidder: ${auction.highestBidder}`;

  return (
    <div className="flex flex-row">
      <img
        src={token.imageSource}
        className="border border-indigo-600 h-80"
      />
      {isActive && (
        <>
          <div className="flex flex-wrap flex-col">
            <div className="p-5">
              {auction.highestBidder === ethers.constants.AddressZero ?
                "Starting bid: " :
                "Highest bid: "}{" "}
              {amountInEthText(auction.highestBid)}
            </div>
            <div className="p-5">{highestBidderMessage}</div>
            <BiddingForm
              auction={auction}
              currentBid={currentBid}
              onAddToBid={onAddToBid}
              onWithdrawBid={onWithdrawBid}
              transactionPending={transactionPending}
            />
          </div>
          <RemainingTime timeRemaining={timeRemaining} />
        </>
      )}
      {!isActive && (
        <div className="flex flex-col p-10">
          {shouldDisplayWithdrawButton && (
            <WithdrawBidButton
              onWithdrawBid={onWithdrawBid}
              currentBid={currentBid}
            />
          )}
          {shouldDisplayClaimButton && <ClaimTokenButton />}
        </div>
      )}
    </div>
  );
};

export default Auction;

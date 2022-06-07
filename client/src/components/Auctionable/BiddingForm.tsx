import { Button, NumericInput } from "@blueprintjs/core";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";

import useConnectedAccount from "src/hooks/use-connected-account";

import { amountInEthText } from "./utils";

import type { Auction as AuctionType } from "src/types/auction";
import type { IUseAuctionable } from "./use-auctionable";

export const WithdrawBidButton = (props: {
  currentBid: BigNumber;
  onWithdrawBid: IUseAuctionable["onWithdrawBid"];
}) => {
  const { currentBid, onWithdrawBid } = props;

  const [withdrawSuccessful, setWithdrawSuccessful] = useState<boolean>();

  const handleWithdrawBid = async () => {
    const success = await onWithdrawBid();
    setWithdrawSuccessful(success);
  };

  const label = currentBid.isZero() ?
    "No bid to withdraw" :
    `Withdraw ${amountInEthText(currentBid)}`;

  return (
    <div className="flex flex-col p-10">
      <Button
        className="h-20"
        text={label}
        onClick={handleWithdrawBid}
        disabled={withdrawSuccessful !== undefined}
      />
      {withdrawSuccessful === true && "Withdraw successful"}
      {withdrawSuccessful === false && "Failed to withdraw"}
    </div>
  );
};

const BiddingForm = (props: {
  auction: AuctionType;
  currentBid: IUseAuctionable["currentBid"];
  onAddToBid: IUseAuctionable["onAddToBid"];
  onWithdrawBid: IUseAuctionable["onWithdrawBid"];
  transactionPending: IUseAuctionable["transactionPending"];
}) => {
  const {
    auction,
    currentBid,
    onAddToBid,
    onWithdrawBid,
    transactionPending
  } = props;

  const { connectedAccount, ConnectAccountButtons } = useConnectedAccount();

  // NOTE: this should not be bidInWei, this should represent the amount to ADD to the bid
  const [bidInWei, setBidInWei] = useState(BigNumber.from(0));

  const handleBidInEth = (bidInEthNumber: number, bidInEthString: string) => {
    // reject negative or "." (invalid) values
    if (isNaN(bidInEthNumber) || bidInEthNumber < 0) return;

    // if remaining value is 0 still setBidInWei (needed for last Total Bid update)
    bidInEthNumber == 0 ?
      setBidInWei(BigNumber.from(0)) :
      setBidInWei(ethers.utils.parseEther(bidInEthString));

    // https://docs.ethers.io/v5/api/utils/display-logic/#display-logic--units
  };

  const addToBid = async () => {
    const success = await onAddToBid(bidInWei);

    // indicate success/failure
  };

  if (!connectedAccount) {
    return <ConnectAccountButtons />;
  }

  const handleTotalBid = () => {
    return currentBid && ethers.utils.formatEther(currentBid?.add(bidInWei));
  };

  const totalBid = currentBid ? bidInWei.add(currentBid) : null;

  const notEnoughForBidding = currentBid && totalBid?.lte(auction.highestBid);

  const isHighestBidder = auction.highestBidder === connectedAccount?.address;

  const shouldDisplayWithdrawButton = auction.highestBidder !== connectedAccount.address;

  return (
    <div className="p-5 flex flex-wrap flex-col">
      <div className="p-5 flex flex-wrap flex-row border-2 rounded-md">
        <div className="border-r-2 p-5 text-justify">
          Current Bid:{" "}
          {currentBid ? ethers.utils.formatEther(currentBid) : null}
          <span> </span> ETH
        </div>
        <div className="border-r-2 px-4 text-center">
          Add to your bid:
          <NumericInput
            placeholder="Enter a number..."
            majorStepSize={0.1}
            min={0}
            stepSize={0.1}
            allowNumericCharactersOnly={true}
            onValueChange={handleBidInEth}
            // TODO: update value and reset after placing bid
          />
        </div>
        <div className="p-5 font-bold font-10">
          Total Bid: {currentBid ? handleTotalBid()?.toString() : null}
          <span> </span> ETH
        </div>
      </div>
      <div className="flex flex-row p-5">
        <Button
          className="flex flex-grow mx-1 "
          text={
            notEnoughForBidding && !isHighestBidder ?
              `Can't place bid (need to add more than ${ethers.utils.formatEther(
                auction.highestBid
                  .add(auction.minimumBidIncrement)
                  .sub(currentBid),
              )} ETH)` :
              "Place Bid"
          }
          onClick={addToBid}
          loading={transactionPending}
          disabled={auction.state !== 1 || notEnoughForBidding}
        />
        {shouldDisplayWithdrawButton && !currentBid.isZero() && (
          <WithdrawBidButton
            currentBid={currentBid}
            onWithdrawBid={onWithdrawBid}
          />
        )}
      </div>
    </div>
  );
};

export default BiddingForm;

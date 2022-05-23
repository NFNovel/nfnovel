import { Button, NumericInput } from "@blueprintjs/core";
import { BigNumber, ethers } from "ethers";
import { useContext, useState } from "react";
import { NFNovelContext } from "src/contexts/nfnovel-context";
import { connectToMetamask } from "src/utils/connect-metamask";
import { useEffect } from "react";

import type { AuctionModalProps } from ".";
import type { Auction } from "src/types/auction";

const BiddingForm = (props: {
  auction: Auction;
  currentBid: BigNumber;
  onAddToBid: AuctionModalProps["onAddToBid"];
  onWithdrawBid: AuctionModalProps["onWithdrawBid"];
}) => {
  const {
    auction,
    currentBid,
    onAddToBid,
    onWithdrawBid
  } = props;

  const {
    connectedAccount,
    metamaskProvider,
    connectContractToSigner
  } = useContext(NFNovelContext);

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

  const withdrawBid = async () => {
    const success = await onWithdrawBid();
  };

  const connectAccount = async () => {
    if (!metamaskProvider) return null;

    const connectedAccount = await connectToMetamask(metamaskProvider);
    if (connectedAccount) connectContractToSigner(connectedAccount);
  };

  if (!metamaskProvider) return null;

  /**
       * 
       * 
       * 
    [currentBid] | [addToBid input] | [total bid (currentBid + addToBid input value)]
    [withdraw bid {currentBid}] | [placeBid]

    [addToBid input]:
    - min (minimum input): highestBid + minimumBidIncrement
    - stepSize: minimumBidIncrement
    - value: highestBid + minimumBidIncrement
      - when component renders set bidInWei to  (highestBid + minimumBidIncrement)
      - after submitting bid set (highestBid + minimumBidIncrement) 
    - auction.minimumBidIncrement

    [withdraw bid button]:
    - disabled if connectedAccount.address == highestBidder
    - disabled if their currentBid is 0
    - button text should be `Withdraw ${currentBid}`

    when the auction ends:

    - if connectedAccount.address == highestBidder then present [mint panel button] => mintPanel(panelTokenId)
    - if not then present [withdraw button]
    - so (remove the add to bid input/button)
      * 
      * 
      */

  if (!connectedAccount)
    return (
      <Button
        className="p-5"
        text="Connect to Metamask"
        onClick={connectAccount}
        disabled={!metamaskProvider}
      />
    );

  const handleTotalBid = () => {
    return currentBid && ethers.utils.formatEther(currentBid?.add(bidInWei));
  };

  const totalBid = currentBid ? bidInWei.add(currentBid) : null;

  const notEnoughForBidding = currentBid && totalBid?.lte(auction.highestBid);

  const isHighestBidder = auction.highestBidder === connectedAccount?.address;

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
          disabled={auction.state !== 1 || notEnoughForBidding}
        />
        <Button
          className="flex flex-grow"
          text={
            currentBid.isZero() ?
              "Nothing to withdraw" :
              `Withdraw bids (${ethers.utils.formatEther(currentBid)})`
          }
          onClick={withdrawBid}
          disabled={currentBid.isZero() || isHighestBidder}
        />
      </div>
    </div>
  );
};

export default BiddingForm;

import { Button, NumericInput } from "@blueprintjs/core";
import { BigNumber, ethers } from "ethers";
import { useContext, useState } from "react";
import { NFNovelContext } from "src/contexts/nfnovel-context";
import { connectToMetamask } from "src/utils/connect-metamask";

import type { AuctionModalProps } from ".";
import type { Auction } from "src/types/auction";

const BiddingForm = (props: {
  auction: Auction;
  onAddToBid: AuctionModalProps["onAddToBid"];
  onWithdrawBid: AuctionModalProps["onWithdrawBid"];
}) => {
  const {
    auction,
    onAddToBid,
    onWithdrawBid
  } = props;

  const {
    connectedAccount,
    metamaskProvider,
    connectContractToSigner
  } = useContext(NFNovelContext);

  const [bidInWei, setBidInWei] = useState(BigNumber.from(0));

  const handleBidInEth = (bidInEthNumber: number, bidInEthString: string) => {
    // reject 0, negative or "." (invalid) values
    if (isNaN(bidInEthNumber) || bidInEthNumber <= 0) return;

    // https://docs.ethers.io/v5/api/utils/display-logic/#display-logic--units
    setBidInWei(ethers.utils.parseEther(bidInEthString));
  };

  const addToBid = async () => {
    const success = await onAddToBid(bidInWei);
    // indicate success/failure
  };

  const withdrawBid = async () => {
    const success = await onWithdrawBid(bidInWei);
  };

  const connectAccount = async () => {
    if (!metamaskProvider) return null;

    const connectedAccount = await connectToMetamask(metamaskProvider);
    if (connectedAccount) connectContractToSigner(connectedAccount);
  };

  if (!metamaskProvider) return null;

  if (!connectedAccount)
    return (
      <Button
        className="p-5"
        text="Connect to Metamask"
        onClick={connectAccount}
        disabled={!metamaskProvider}
      />
    );

  if (auction.state !== 1)
    return (
      bidInWei && (
        <Button
          className="p-5"
          text={`Withdraw ${ethers.utils.formatEther(bidInWei)}`}
          onClick={withdrawBid}
        />
      )
    );

  return (
    <div className="p-5 flex flex-wrap flex-col">
      <div>Place your Bid: </div>
      <NumericInput
        placeholder="Enter a number..."
        majorStepSize={0.1}
        min={0}
        stepSize={0.1}
        allowNumericCharactersOnly={true}
        onValueChange={handleBidInEth}
      />
      <Button
        className="p-5"
        text="Place Bid"
        onClick={addToBid}
        disabled={auction.state !== 1}
      />
    </div>
  );
};

export default BiddingForm;

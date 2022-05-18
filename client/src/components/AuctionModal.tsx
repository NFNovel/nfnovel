/* eslint-disable @next/next/no-img-element */
import { Button, Drawer, NumericInput, Position } from "@blueprintjs/core";
import { BigNumber, ethers } from "ethers";
import { useState, useContext, useEffect } from "react";
import { NFNovelContext } from "src/contexts/nfnovel-context";
import { DateTime, Duration } from "luxon";

export interface IAuction {
  state: AuctionStates;
  id: BigNumber;
  tokenId: BigNumber;
  startTime: BigNumber;
  endTime: BigNumber;
  startingValue: BigNumber;
  minimumBidValue: BigNumber;
  highestBid: BigNumber;
  highestBidder: string;
}

export enum AuctionStates {
  Pending,
  Active,
  Ended,
  Cancelled,
}

function AuctionModal(props: any) {
  const [visible, setVisibility] = useState(false);
  const [bidInEth, setBidInEth] = useState(0);
  const [panelAuctionId, setPanelAuctionId] = useState<BigNumber>();
  const [auction, setAuction] = useState<IAuction>();
  const [timeRemaining, setTimeRemaining] = useState<Duration>();

  const {
    nfnovel, // novel contract instance
  } = useContext(NFNovelContext);

  const panelId = 1; // receive as a prop from modal call

  useEffect(() => {
    const getPanelAuctionId = async () => {
      if (!nfnovel) return null;
      const panelAuctionId = await nfnovel.getPanelAuctionId(panelId);
      setAuction(await nfnovel.auctions(panelAuctionId));
      setPanelAuctionId(panelAuctionId);
    };
    const updateTimeLeft = () => {
      if (!auction) return;
      console.log({
        dateTime: DateTime.fromSeconds(auction.endTime.toNumber()).diffNow([
          "seconds",
        ]).seconds,
        endTime: DateTime.fromSeconds(auction.endTime.toNumber()).toSeconds(),
        current: Date.now(),
      });
      setTimeRemaining(
        DateTime.fromSeconds(auction.endTime.toNumber()).diffNow([
          "seconds",
          "hours",
          "minutes",
        ]),
      );
    };
    getPanelAuctionId();
    updateTimeLeft();
  }, [panelAuctionId, nfnovel, auction, timeRemaining]);

  const visibleOn = () => {
    setVisibility(true);
  };

  const visibleOff = () => {
    setVisibility(false);
  };

  const handleBidInEth = (bidInETH: number) => {
    setBidInEth(bidInETH);
  };

  const placeBid = async () => {
    if (!panelAuctionId || !nfnovel) return null;

    await nfnovel.placeBid(panelAuctionId, {
      value: ethers.constants.WeiPerEther.mul(bidInEth),
    });
  };

  if (!auction) return null;

  return (
    <>
      <Drawer
        isOpen={visible}
        title="Place your Bid for this Panel"
        icon="info-sign"
        position={Position.BOTTOM}
        canEscapeKeyClose={true}
        canOutsideClickClose={false}
        enforceFocus={true}
        autoFocus={true}
        onClose={visibleOff}
        usePortal={true}
        hasBackdrop={true}
      >
        <div className="flex flex-row">
          <img
            src={
              "https://gateway.pinata.cloud/ipfs/QmdHcSkrPw8D7MoxuZ2VZ8H6KYDvhVphVxy7rZyNAo8EHZ"
            }
            className="border border-indigo-600 h-80"
          />
          <div className="flex flex-wrap flex-col">
            <div className="p-5">
              Highest bid:{" "}
              {auction?.highestBid.div(ethers.constants.WeiPerEther).toString()}{" "}
              ETH
            </div>
            <div className="p-5">Highest bidder: {auction?.highestBidder}</div>
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
            </div>
            <Button
              className="p-5"
              text="Place Bid"
              onClick={placeBid}
            ></Button>
          </div>

          <div className="bg-red-400 p-10 flex flex-col">
            Time remaining!{" "}
            <div>
              {!timeRemaining ?
                "HELLO WORLD" :
                timeRemaining.toFormat(
                  "hh 'hours', mm 'minutes', ss 'seconds'",
                )}
            </div>
          </div>
        </div>
      </Drawer>
      <Button
        className="bp4-minimal p-10"
        text="Open modal"
        onClick={visibleOn}
      ></Button>
    </>
  );
}

export default AuctionModal;

import { useCallback, useContext, useEffect, useState } from "react";
import { NFNovelContext } from "src/contexts/nfnovel-context";
import { Button, Spinner } from "@blueprintjs/core";
import { BigNumber, ethers } from "ethers";

import AuctionModal from "./AuctionModal";

import type { Auction } from "src/types/auction";
import type { PanelData } from "src/contexts/panel-context";

type PanelProps = {
  panelData: PanelData;
};

const Panel = (props: PanelProps) => {
  const {
    metadata,
    imageSource,
    panelTokenId
  } = props.panelData;

  const { nfnovel, connectedAccount } = useContext(NFNovelContext);

  // FUTURE: create a WithAuction context provider that wraps around AuctionModal
  // should take as props: contract instance, isOpen, onMint and hooks for various calls
  // should move all this listener / update / auction props stuff into it
  const [auction, setAuction] = useState<Auction>();
  const [currentBid, setCurrentBid] = useState<BigNumber>(BigNumber.from(0));
  const [auctionIsOpen, setAuctionIsOpen] = useState<boolean>(false);

  const handleEndAuction = useCallback(
    (panelAuctionId: BigNumber) =>
      setAuction((currentAuction) => {
        if (!currentAuction) return;
        if (!panelAuctionId.eq(currentAuction.id)) return currentAuction;

        // cannot mutate state (readonly)
        // return a new object merging currentAuction with new state field value
        return Object.assign({}, currentAuction, { state: 2 });
      }),
    [],
  );

  const handleBidRaised = useCallback(
    (
      panelAuctionId: BigNumber,
      highestBidder: string,
      highestBid: BigNumber,
    ) => {
      if (!nfnovel || !connectedAccount || !auction) return;

      if (!panelAuctionId.eq(auction.id)) return;

      setAuction(Object.assign({}, auction, { highestBid, highestBidder }));

      if (highestBidder === connectedAccount.address) setCurrentBid(highestBid);
    },
    [nfnovel, auction, connectedAccount],
  );

  const handleBidWithdrawn = useCallback(
    (panelAuctionId: BigNumber, withdrawingBidder: string) => {
      if (!auction || !connectedAccount) return;
      if (!panelAuctionId.eq(auction.id)) return;

      if (withdrawingBidder === connectedAccount.address)
        setCurrentBid(BigNumber.from(0));
    },
    [auction, connectedAccount],
  );

  useEffect(() => {
    const getPanelAuction = async () => {
      if (!nfnovel) return null;

      const panelAuctionId = await nfnovel.getPanelAuctionId(panelTokenId);
      setAuction(await nfnovel.auctions(panelAuctionId));

      // only run if they are authenticated
      if (nfnovel.signer) {
        setCurrentBid(await nfnovel.checkBid(panelAuctionId));
      }
    };

    getPanelAuction();
  }, [nfnovel, panelTokenId]);

  useEffect(() => {
    const setUpAuctionListeners = () => {
      if (!nfnovel) return;

      nfnovel.on(
        nfnovel.interface.events["AuctionEnded(uint256,address,uint256,string)"]
          .name,
        handleEndAuction,
      );

      nfnovel.on(
        nfnovel.interface.events["AuctionBidRaised(uint256,address,uint256)"]
          .name,
        handleBidRaised,
      );

      nfnovel.on(
        nfnovel.interface.events["AuctionBidWithdrawn(uint256,address,uint256)"]
          .name,
        handleBidWithdrawn,
      );
    };

    setUpAuctionListeners();

    return () => {
      if (!nfnovel) return;

      nfnovel.removeListener(
        nfnovel.interface.events["AuctionEnded(uint256,address,uint256,string)"]
          .name,
        handleEndAuction,
      );

      nfnovel.removeListener(
        nfnovel.interface.events["AuctionBidRaised(uint256,address,uint256)"]
          .name,
        handleBidRaised,
      );

      nfnovel.removeListener(
        nfnovel.interface.events["AuctionBidWithdrawn(uint256,address,uint256)"]
          .name,
        handleBidWithdrawn,
      );
    };
  }, [nfnovel, handleEndAuction, handleBidRaised, handleBidWithdrawn]);

  const openAuctionModal = () => !auctionIsOpen && setAuctionIsOpen(true);
  const closeAuctionModal = () => auctionIsOpen && setAuctionIsOpen(false);

  if (!imageSource || !metadata) return null;
  if (!nfnovel || !auction) return <Spinner />;

  // TODO: refactor to useCallback
  const handleAddToBid = async (amountInWei: BigNumber) => {
    try {
      await nfnovel.addToBid(auction.id, { value: amountInWei });
      // NOTE: pass waitingOnEvent prop down to AuctionModal/children
      // they should present a loading / spinner when waiting on event
      // setWaitingOnEvent(true);

      return true;
    } catch (error: any) {
      console.error("addToBid failed", {
        panelTokenId,
        panelAuctionId: auction.id,
        error: error,
      });

      return false;
    }
  };

  const handleMintPanel = async () => {
    try {
      await nfnovel.mintPanel(auction.id);

      return true;
    } catch (error: any) {
      console.error("mintPanel failed", {
        panelTokenId,
        panelAuctionId: auction.id,
        error: error,
      });

      return false;
    }
  };

  const handleWithdrawBid = async () => {
    try {
      await nfnovel.withdrawBid(auction.id);

      return true;
    } catch (error: any) {
      console.error("withdrawBid failed", {
        panelTokenId,
        panelAuctionId: auction.id,
        error: error,
      });

      return false;
    }
  };

  console.log({
    currentBid: currentBid && ethers.utils.formatEther(currentBid),
  });

  return (
    <article className="max-w-md mx-auto mt-4 bg-blue-800 shadow-lg border rounded-md duration-300 hover:shadow-sm">
      <div className="filter opacity-100 hover:opacity-50 hover:red-500 duration-1000">
        <Button onClick={openAuctionModal}>
          <img
            src={imageSource}
            className="w-full h-48 rounded-t-md"
          />
          <AuctionModal
            imageSource={imageSource}
            auction={auction}
            currentBid={currentBid}
            isOpen={auctionIsOpen}
            metadata={metadata}
            hasConnectedAccount={!!connectedAccount}
            onAddToBid={handleAddToBid}
            onClose={closeAuctionModal}
            onWithdrawBid={handleWithdrawBid}
            onMintPanel={handleMintPanel}
          />
        </Button>
      </div>
    </article>
  );
};

export default Panel;

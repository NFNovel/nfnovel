import { useCallback, useContext, useEffect, useState } from "react";
import { NFNovelContext } from "src/contexts/nfnovel-context";
import { Button, Spinner } from "@blueprintjs/core";
import { BigNumber } from "ethers";

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

  const [auction, setAuction] = useState<Auction>();
  const [auctionIsOpen, setAuctionIsOpen] = useState<boolean>(false);

  useEffect(() => {
    const getPanelAuction = async () => {
      if (!nfnovel) return null;

      const panelAuctionId = await nfnovel.getPanelAuctionId(panelTokenId);
      setAuction(await nfnovel.auctions(panelAuctionId));
    };

    getPanelAuction();
  }, [nfnovel, panelTokenId]);

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
    (panelAuctionId: BigNumber, highestBidder: string, highestBid: BigNumber) =>
      setAuction((currentAuction) => {
        console.log("handleBidRaised", {
          panelAuctionId: panelAuctionId.toString(),
          highestBidder,
          highestBid: highestBid.toString(),
        });
        if (!currentAuction) return;
        if (!panelAuctionId.eq(currentAuction.id)) return currentAuction;

        console.log("setting new highest bid and highest bidder");

        return Object.assign({}, currentAuction, { highestBid, highestBidder });
      }),
    [],
  );

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
    };
  }, [nfnovel, handleBidRaised, handleEndAuction]);

  const openAuctionModal = () => !auctionIsOpen && setAuctionIsOpen(true);
  const closeAuctionModal = () => auctionIsOpen && setAuctionIsOpen(false);

  if (!imageSource || !metadata) return null;
  if (!nfnovel || !auction) return <Spinner />;

  const handleAddToBid = async (amountInWei: BigNumber) => {
    try {
      const tx = await nfnovel.addToBid(auction.id, { value: amountInWei });
      await tx.wait();

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
      const tx = await nfnovel.mintPanel(auction.id);
      await tx.wait();

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

  const handleCheckBid = async () => {
    const bid = await nfnovel.checkBid(auction.id);

    return bid;
  };

  const handleWithdrawBid = async () => {
    try {
      const tx = await nfnovel.withdrawBid(auction.id);
      await tx.wait();

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
            isOpen={auctionIsOpen}
            metadata={metadata}
            hasConnectedAccount={!!connectedAccount}
            onAddToBid={handleAddToBid}
            onClose={closeAuctionModal}
            getCurrentBid={handleCheckBid}
            onWithdrawBid={handleWithdrawBid}
            onMintPanel={handleMintPanel}
          />
        </Button>
      </div>
    </article>
  );
};

export default Panel;

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

  // TODO: Set up and test listeners outside react
  useEffect(() => {
    const setUpAuctionListener = () => {
      if (!nfnovel) return;
      nfnovel.once(
        nfnovel.interface.events["AuctionEnded(uint256,address,uint256,string)"]
          .name,
        async (panelAuctionId: BigNumber) => {
          if (!auction || !nfnovel) return;
          if (panelAuctionId !== auction.id) return;
          setAuction(await nfnovel.auctions(panelAuctionId));

          console.log("Auction ended", { auction });
        },
      );
      console.log("Listener started", {
        listeners: nfnovel.listeners,
        listenerCounter: nfnovel.listenerCount,
      });
    };

    setUpAuctionListener();

    // return () => {
    //   if (!nfnovel) return;
    //   nfnovel.removeListener(
    //     nfnovel.interface.events["AuctionEnded(uint256,address,uint256,string)"]
    //       .name,
    //     setAuctionEnded,
    //   );
    //   console.log("Listener ended");
    // };
  }, [nfnovel, panelTokenId]);

  const openAuctionModal = () => !auctionIsOpen && setAuctionIsOpen(true);
  const closeAuctionModal = () => auctionIsOpen && setAuctionIsOpen(false);

  if (!imageSource || !metadata) return null;
  if (!nfnovel || !auction) return <Spinner />;

  const handleAddToBid = async (amountInWei: BigNumber) => {
    try {
      const tx = await nfnovel.addToBid(auction.id, { value: amountInWei });
      await tx.wait();

      setAuction(await nfnovel.auctions(auction.id));

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

  // TODO: implement calling mintPanel on nfnovel
  const handleMintPanel = async () => {
    try {
      const tx = await nfnovel.mintPanel(auction.id);
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

  // TODO: render the mintPanel button if
  // auction.state == 2 (Ended) && connectedAccount.address == auction.highestBidder && ownerOf(panelTokenId) == address(0)

  const handleCheckBid = async () => {
    const bid = await nfnovel.checkBid(auction.id);

    return bid;
  };

  // TODO: implement calling withdrawBid on nfnovel
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

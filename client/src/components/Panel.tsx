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
      console.log("getPanelAuction called");

      const panelAuctionId = await nfnovel.getPanelAuctionId(panelTokenId);
      setAuction(await nfnovel.auctions(panelAuctionId));
    };

    getPanelAuction();
  }, [nfnovel, panelTokenId]);

  const openAuctionModal = () => !auctionIsOpen && setAuctionIsOpen(true);
  const closeAuctionModal = () => auctionIsOpen && setAuctionIsOpen(false);

  if (!imageSource || !metadata) return null;
  if (!nfnovel || !auction) return <Spinner />;

  const handleBid = async (amountInWei: BigNumber) => {
    try {
      await nfnovel.placeBid(auction.id, { value: amountInWei });

      setAuction(await nfnovel.auctions(auction.id));

      return true;
    } catch (error: any) {
      console.error("placeBid failed", {
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
            onPlaceBid={handleBid}
            onClose={closeAuctionModal}
          />
        </Button>
      </div>
    </article>
  );
};

export default Panel;

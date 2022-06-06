import { useCallback, useEffect, useState } from "react";
import { Button, Drawer, Position, Spinner } from "@blueprintjs/core";
import useNFNovel from "src/hooks/use-nfnovel";
import useConnectedAccount from "src/hooks/use-connected-account";
import { BigNumber } from "ethers";

import AuctionManager from "./Auctionable/Auction";
import MintTokenButton from "./Auctionable/MintTokenButton";

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

  const { nfnovel } = useNFNovel();
  const { connectedAccount } = useConnectedAccount();

  const [auctionIsOpen, setAuctionIsOpen] = useState<boolean>(false);

  const [panelAuctionId, setPanelAuctionId] = useState<BigNumber>();

  useEffect(() => {
    const loadPanelAuctionId = async () => {
      setPanelAuctionId(await nfnovel.getPanelAuctionId(panelTokenId));
    };

    if (!panelAuctionId) loadPanelAuctionId();
  }, [panelTokenId, panelAuctionId, nfnovel]);

  const openAuctionModal = useCallback(
    () => !auctionIsOpen && setAuctionIsOpen(true),
    [auctionIsOpen],
  );

  const closeAuctionModal = useCallback(
    () => auctionIsOpen && setAuctionIsOpen(false),
    [auctionIsOpen],
  );

  const handleMintPanel = useCallback(async () => {
    try {
      await nfnovel.mintPanel(panelTokenId);

      return true;
    } catch (error: any) {
      console.error("mintPanel failed", {
        panelTokenId,
        error: error,
      });

      return false;
    }
  }, [nfnovel, panelTokenId]);

  if (!imageSource || !metadata) return null;

  if (!panelAuctionId) return <Spinner />;

  return (
    <article className="max-w-md mx-auto mt-4 bg-blue-800 shadow-lg border rounded-md duration-300 hover:shadow-sm">
      <div className="filter opacity-100 hover:opacity-50 hover:red-500 duration-1000">
        <Button onClick={openAuctionModal}>
          <img
            src={imageSource}
            className="w-full h-48 rounded-t-md"
          />
        </Button>
        <Drawer
          isOpen={auctionIsOpen}
          title="Place your Bid for this Panel"
          icon="info-sign"
          position={Position.BOTTOM}
          canEscapeKeyClose={true}
          canOutsideClickClose={true}
          enforceFocus={true}
          autoFocus={true}
          onClose={closeAuctionModal}
          usePortal={true}
          hasBackdrop={true}
        >
          <AuctionManager
            auctionId={panelAuctionId}
            auctionableContract={nfnovel}
            connectedAccountAddress={connectedAccount?.address}
            token={{
              metadata,
              imageSource,
              tokenId: panelTokenId,
            }}
            ClaimTokenButton={() => (
              <MintTokenButton
                buttonLabel="Mint Panel!"
                onMint={handleMintPanel}
                erc721Contract={nfnovel}
              />
            )}
          />
        </Drawer>
      </div>
    </article>
  );
};

export default Panel;

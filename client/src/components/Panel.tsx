import { useCallback, useEffect, useState } from "react";
import { Button, Spinner } from "@blueprintjs/core";
import useNFNovel from "src/hooks/use-nfnovel";
import useConnectedAccount from "src/hooks/use-connected-account";

import AuctionManager from "./AuctionModal/AuctionManager";

import type { BigNumber } from "ethers";
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

  const { connectedAccount } = useConnectedAccount();
  const { nfnovel, nfnovelContractConfig } = useNFNovel();
  const [panelAuctionId, setPanelAuctionId] = useState<BigNumber>();
  const [auctionIsOpen, setAuctionIsOpen] = useState<boolean>(false);

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

  if (!imageSource || !metadata) return null;

  if (!panelAuctionId) return <Spinner />;

  // const handleMintPanel = async () => {
  //   try {
  //     await nfnovel.mintPanel(panelTokenId);

  //     return true;
  //   } catch (error: any) {
  //     console.error("mintPanel failed", {
  //       panelTokenId,
  //       error: error,
  //     });

  //     return false;
  //   }
  // };

  return (
    <article className="max-w-md mx-auto mt-4 bg-blue-800 shadow-lg border rounded-md duration-300 hover:shadow-sm">
      <div className="filter opacity-100 hover:opacity-50 hover:red-500 duration-1000">
        <Button onClick={openAuctionModal}>
          <img
            src={imageSource}
            className="w-full h-48 rounded-t-md"
          />
          <AuctionManager
            auctionId={panelAuctionId}
            auctionableContract={nfnovel}
            connectedAccount={connectedAccount}
            auctionableContractConfig={nfnovelContractConfig}
            tokenData={{
              metadata,
              imageSource,
              tokenId: panelTokenId,
            }}
            modalProps={{ isOpen: auctionIsOpen, onClose: closeAuctionModal }}
          />
        </Button>
      </div>
    </article>
  );
};

export default Panel;

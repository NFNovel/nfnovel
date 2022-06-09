import { BigNumber } from "ethers";
import { Box, Image } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { Drawer, Position, Spinner } from "@blueprintjs/core";

import useNFNovel from "src/hooks/use-nfnovel";
import useConnectedAccount from "src/hooks/use-connected-account";

import AuctionManager from "./Auctionable/Auction";
import MintTokenButton from "./Auctionable/MintTokenButton";

import type { PanelColumn } from "src/types/page";
import type { PanelData } from "src/contexts/panel-context";

export type PanelProps = PanelData & Omit<PanelColumn, "panelTokenId">;

// TODO: use description to give summary of panel scene on hover
// THINK: ability to magnify image (once sold, instead of auction)
const Panel = (props: PanelProps) => {
  const {
    metadata,
    imageSource,
    columnWidth,
    panelTokenId
  } = props;

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
    <Box
      as="button"
      borderWidth="1px"
      borderColor="red"
      height={"100%"}
      flex={columnWidth}
    >
      <Image
        src={imageSource}
        alt={metadata?.description}
        onClick={openAuctionModal}
      />

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
    </Box>
  );
};

export default Panel;

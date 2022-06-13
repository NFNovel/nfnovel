import { BigNumber } from "ethers";
import { Box, Image } from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";
import { Drawer, Position, Spinner } from "@blueprintjs/core";

import useNFNovel from "src/hooks/use-nfnovel";
import useConnectedAccount from "src/hooks/use-connected-account";

import AuctionManager from "./Auctionable/Auction";
import MintTokenButton from "./Auctionable/MintTokenButton";

import type { PanelColumn } from "src/types/page";
import type { IpfsPanelData } from "src/hooks/use-nfnovel-ipfs-data";

export type PanelProps = IpfsPanelData & Omit<PanelColumn, "panelTokenId">;

// TODO: use description to give summary of panel scene on hover
// THINK: ability to magnify image (once sold, instead of auction)
const Panel = (props: PanelProps) => {
  const {
    metadata,
    imageSource,
    columnWidth,
    panelTokenId
  } = props;

  const { nfnovelSigner, getPanelAuctionId } = useNFNovel();
  const { connectedAccount } = useConnectedAccount();

  const [auctionIsOpen, setAuctionIsOpen] = useState<boolean>(false);

  const [panelAuctionId, setPanelAuctionId] = useState<BigNumber>();

  useEffect(() => {
    const loadPanelAuctionId = async () => {
      setPanelAuctionId(await getPanelAuctionId(panelTokenId));
    };

    if (!panelAuctionId) loadPanelAuctionId();
  }, [panelTokenId, panelAuctionId, getPanelAuctionId]);

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
      await nfnovelSigner.mintPanel(panelTokenId);

      return true;
    } catch (error: any) {
      console.error("mintPanel failed", {
        panelTokenId,
        error: error,
      });

      return false;
    }
  }, [nfnovelSigner, panelTokenId]);

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
          auctionableContract={nfnovelSigner}
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
              erc721Contract={nfnovelSigner}
            />
          )}
        />
      </Drawer>
    </Box>
  );
};

export default Panel;

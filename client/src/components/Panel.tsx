import { BigNumber } from "ethers";
import {
  Text,
  Box,
  Image,
  Spinner,
  useDisclosure,
  Collapse,
} from "@chakra-ui/react";
import { useCallback, useEffect, useState } from "react";

import useNFNovel from "src/hooks/use-nfnovel";
import useConnectedAccount from "src/hooks/use-connected-account";

import AuctionManager from "./Auctionable/Auction";
import MintTokenButton from "./Auctionable/MintTokenButton";
import StyledButton from "./StyledButton";

import type { PanelColumn } from "src/types/page";
import type { IpfsPanelData } from "src/hooks/use-nfnovel-ipfs-data";

export type PanelProps = IpfsPanelData & Omit<PanelColumn, "panelTokenId">;

// TODO: use description to give summary of panel scene on hover
const Panel = (props: PanelProps) => {
  const {
    metadata,
    imageSource,
    columnWidth,
    panelTokenId,
  } = props;

  const { connectedAccount, updateConnectedAccount } = useConnectedAccount();
  const {
    nfnovelSigner,
    nfnovelReader,
    isPanelSold,
    getPanelAuctionId,
  } = useNFNovel();
  const { isOpen, onToggle } = useDisclosure();

  const [panelIsSold, setPanelIsSold] = useState(false);
  const [panelAuctionId, setPanelAuctionId] = useState<BigNumber>();

  useEffect(() => {
    const loadPanelAuctionId = async () => {
      setPanelAuctionId(await getPanelAuctionId(panelTokenId));
    };

    if (!panelAuctionId) loadPanelAuctionId();
  }, [panelTokenId, panelAuctionId, getPanelAuctionId]);

  useEffect(() => {
    const checkIfPanelIsSold = async () => {
      if (!panelTokenId) return;

      const isSold = await isPanelSold(panelTokenId);
      setPanelIsSold(isSold);
    };

    checkIfPanelIsSold();
    // NOTE: check again if the connected account becomes a panel owner
  }, [panelTokenId, isPanelSold, connectedAccount?.isPanelOwner]);

  const handleMintPanel = useCallback(async () => {
    try {
      await nfnovelSigner.mintPanel(panelTokenId);
      await updateConnectedAccount();
      setPanelIsSold(true);

      return true;
    } catch (error: any) {
      console.error("mintPanel failed", {
        panelTokenId,
        error: error,
      });

      return false;
    }
  }, [nfnovelSigner, panelTokenId, updateConnectedAccount]);

  if (!imageSource || !metadata) return null;

  if (!panelAuctionId) return <Spinner />;

  return (
    <Box
      height={"100%"}
      flex={columnWidth}
    >
      <Image
        src={imageSource}
        cursor={"pointer"}
        onClick={onToggle}
        alt={metadata?.description}
      />
      <Box
        height={"100%"}
        width={"100%"}
      >
        <Collapse
          in={isOpen}
          unmountOnExit
        >
          <AuctionManager
            auctionId={panelAuctionId}
            auctionableReader={nfnovelReader}
            auctionableSigner={nfnovelSigner}
            connectedAccountAddress={connectedAccount?.address}
            token={{
              metadata,
              imageSource,
              tokenId: panelTokenId,
            }}
            ClaimTokenButton={() =>
              panelIsSold ? (
                <Text>You own panel {panelTokenId.toString()}!</Text>
              ) : (
                <MintTokenButton
                  buttonLabel="Mint Panel!"
                  onMint={handleMintPanel}
                  erc721Contract={nfnovelSigner}
                />
              )
            }
          />
        </Collapse>
      </Box>
    </Box>
  );
};

export default Panel;

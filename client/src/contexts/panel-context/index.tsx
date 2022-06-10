import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { create as createIPFSClient } from "ipfs-core";
import { BigNumber } from "ethers";
import { Spinner, ToastId, useToast } from "@chakra-ui/react";

import { Page } from "src/types/page";
import PanelOwnerService from "src/services/panel-owner-service";
import useNFNovel from "src/hooks/use-nfnovel";

import useConnectedAccount from "../../hooks/use-connected-account";

// TODO: refactor to generic ipfsGetMetadata, ipfsGetImageSource
// expose through useIPFS()
import { getPanelMetadata, getPanelImageSource } from "./utils";

import type { IPFS } from "ipfs-core";
import type { ipfsURI, PanelMetadata } from "src/types/token";

export type PanelData = {
  imageSource: string | null;
  metadata: PanelMetadata | null;
  panelTokenId: BigNumber | number;
};

export type PanelContext = {
  getPagePanelsData: (page: Page) => Promise<PanelData[]>;
};

export const PanelContext = createContext<PanelContext | null>(null);

// TODO: refactor into IPFSProvider and usePanelData hook
const WithPanelData = (props: { children?: React.ReactNode }) => {
  const { children } = props;

  const toast = useToast({
    position: "top",
  });

  const { nfnovel } = useNFNovel();
  const { connectedAccount } = useConnectedAccount();

  const [ipfsNode, setIpfsNode] = useState<IPFS | null>(null);
  const [ipfsStatus, setIpfsStatus] = useState<
  "connected" | "connecting" | "error"
  >("connecting");

  const cachedTokenURIs = useMemo(
    () => new Map<BigNumber | number, string>(),
    [],
  );

  useEffect(() => {
    switch (ipfsStatus) {
      case "connecting":
        toast({ description: "Connecting to IPFS...", icon: <Spinner /> });
        break;
      case "connected":
        toast({
          status: "success",
          description: "Connected to IPFS!",
        });
        break;
      case "error":
        toast({
          status: "error",
          description: "Unable to connect to IPFS :(",
        });
    }
  }, [ipfsStatus]);

  useEffect(() => {
    const loadIpfsClient = async () => {
      try {
        const ipfsNode = await createIPFSClient();

        setIpfsNode(ipfsNode);
        setIpfsStatus("connected");
      } catch (error) {
        console.error("error loading IPFS", error);
        setIpfsStatus("error");
      }
    };

    if (ipfsStatus === "connecting") loadIpfsClient();
  }, [ipfsStatus]);

  const getPagePanelsData = useCallback(
    async (page: Page): Promise<PanelData[]> => {
      if (!ipfsNode) return [];

      const pagePanelsData = [];
      for (const panelTokenId of page.panelTokenIds) {
        // const isSold = await PanelOwnerService.isPanelSold(
        //   nfnovel,
        //   panelTokenId,
        // );

        // // if: the page is not yet publicly revealed, the connected account is a panel owner (at least 1 panel) and the panel has been sold (owned by any account)
        // // then: the user (owner) should be able  to see the revealed image(s)!
        // const shouldRequestRevealedMetadata = !page.isRevealed && connectedAccount?.isPanelOwner && isSold;

        const isSold = true;
        const shouldRequestRevealedMetadata = true;

        let metadata: PanelMetadata | null;
        if (shouldRequestRevealedMetadata) {
          metadata = await PanelOwnerService.getRevealedPanelMetadata(
            panelTokenId,
          );
        } else {
          // attempt to get from cache
          let panelTokenURI = cachedTokenURIs.get(panelTokenId) || null;
          if (!panelTokenURI) {
            // attempt to load
            panelTokenURI = await nfnovel
              .tokenURI(panelTokenId)
              .catch((error) => {
                console.error("error loading panel token URI", error.message);

                return null;
              });

            // if found then add to cache
            if (panelTokenURI) cachedTokenURIs.set(panelTokenId, panelTokenURI);
          }

          metadata = await getPanelMetadata(ipfsNode, panelTokenURI as ipfsURI);
        }

        const imageSource = await getPanelImageSource(
          ipfsNode,
          metadata ? metadata.image : null,
        );

        pagePanelsData.push({
          metadata,
          imageSource,
          panelTokenId,
        });
      }

      return pagePanelsData;
    },
    [connectedAccount?.isPanelOwner, ipfsNode, nfnovel, cachedTokenURIs],
  );

  return (
    <PanelContext.Provider value={{ getPagePanelsData }}>
      {children}
    </PanelContext.Provider>
  );
};

export default WithPanelData;

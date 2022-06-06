import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { create as createIPFSClient } from "ipfs-core";
import { Page } from "src/types/page";
import { BigNumber } from "ethers";
import PanelOwnerService from "src/services/panel-owner-service";
import useNFNovel from "src/hooks/use-nfnovel";

import useConnectedAccount from "../../hooks/use-connected-account";

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
  const { nfnovel } = useNFNovel();
  const { connectedAccount } = useConnectedAccount();

  const [loadingIPFS, setLoadingIPFS] = useState(true);
  const [ipfsClient, setIpfsClient] = useState<IPFS | null>(null);

  const cachedTokenURIs = useMemo(
    () => new Map<BigNumber | number, string>(),
    [],
  );

  useEffect(() => {
    const loadIpfsClient = async () => {
      const ipfsClient = await createIPFSClient();
      setIpfsClient(ipfsClient);
      setLoadingIPFS(false);
    };

    if (!ipfsClient) loadIpfsClient();
  }, [ipfsClient]);

  const getPagePanelsData = useCallback(
    async (page: Page): Promise<PanelData[]> => {
      if (!ipfsClient) return [];

      const pagePanelsData = [];
      for (const panelTokenId of page.panelTokenIds) {
        const isSold = await PanelOwnerService.isPanelSold(
          nfnovel,
          panelTokenId,
        );

        // if: the page is not yet publicly revealed, the connected account is a panel owner (at least 1 panel) and the panel has been sold (owned by any account)
        // then: the user (owner) should be able  to see the revealed image(s)!
        const shouldRequestRevealedMetadata = !page.isRevealed && connectedAccount?.isPanelOwner && isSold;

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

          metadata = await getPanelMetadata(
            ipfsClient,
            panelTokenURI as ipfsURI,
          );
        }

        const imageSource = await getPanelImageSource(
          ipfsClient,
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
    [connectedAccount?.isPanelOwner, ipfsClient, nfnovel, cachedTokenURIs],
  );

  return (
    <PanelContext.Provider value={{ getPagePanelsData }}>
      {!ipfsClient && "Connecting to IPFS..."}
      {children}
    </PanelContext.Provider>
  );
};

export default WithPanelData;

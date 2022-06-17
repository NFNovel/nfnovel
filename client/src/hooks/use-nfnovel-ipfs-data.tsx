import { useMemo, useCallback } from "react";

import PanelOwnerService from "src/services/panel-owner-service";

import useIpfs from "./use-ipfs";
import useConnectedAccount from "./use-connected-account";
import useNFNovel from "./use-nfnovel";

import type { BigNumberish } from "ethers";
import type { ipfsURI, PanelMetadata } from "src/types/token";
import type { Page as PageType, PageMetadata } from "src/types/page";

// TODO: rename to IpfsPanelData
export type IpfsPanelData = {
  imageSource: string;
  metadata: PanelMetadata;
  panelTokenId: BigNumberish;
};

// TODO: make available at <Page.baseURL>/metadata
const mockPageMetadata: { [pageNumber: string]: PageMetadata } = {
  "1": {
    pageNumber: 1,
    panelRows: [
      {
        rowHeight: "100%",
        panelColumns: [{ panelTokenId: 1, columnWidth: "100%" }],
      },
    ],
  },
  "2": {
    pageNumber: 2,
    panelRows: [
      {
        rowHeight: "40%",
        panelColumns: [
          { panelTokenId: 2, columnWidth: "40%" },
          { panelTokenId: 3, columnWidth: "60%" },
        ],
      },
      {
        rowHeight: "20%",
        panelColumns: [{ panelTokenId: 4, columnWidth: "100%" }],
      },
      {
        rowHeight: "20%",
        panelColumns: [{ panelTokenId: 5, columnWidth: "100%" }],
      },
      {
        rowHeight: "20%",
        panelColumns: [{ panelTokenId: 6, columnWidth: "100%" }],
      },
    ],
  },
};

const useNFNovelIpfsData = () => {
  const { connectedAccount } = useConnectedAccount();
  const { isPanelSold, getPanelTokenUri } = useNFNovel();
  const {
    status,
    loadJSON,
    loadImageSource,
  } = useIpfs({
    pinOnLoad: true,
    throwOnError: false,
  });

  const cachedTokenURIs = useMemo(() => new Map<BigNumberish, string>(), []);

  const getPageMetadata = useCallback(
    async (page: PageType): Promise<PageMetadata | null> => {
      const pageMetadataURI = `${page.baseURI}/metadata`;

      const pageMetadata = await loadJSON(pageMetadataURI as ipfsURI);

      return pageMetadata as PageMetadata;
    },
    [loadJSON],
  );

  const getPagePanelsData = useCallback(
    async (page: PageType): Promise<IpfsPanelData[]> => {
      const pagePanelsData = [];
      for (const panelTokenId of page.panelTokenIds) {
        const isSold = await isPanelSold(panelTokenId);

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
            // not in cache, attempt to load
            panelTokenURI = await getPanelTokenUri(panelTokenId);

            // if found then add to cache
            if (panelTokenURI) cachedTokenURIs.set(panelTokenId, panelTokenURI);
          }

          metadata = (await loadJSON(
            panelTokenURI as ipfsURI,
          )) as PanelMetadata;
        }

        if (!metadata)
          throw new Error(
            `Failed to load panel metadata for panelTokenId: ${panelTokenId.toString()}`,
          );

        const imageSource = await loadImageSource(metadata.image);
        if (!imageSource)
          throw new Error(
            `Failed to load image source for panelTokenId: ${panelTokenId.toString()}`,
          );

        pagePanelsData.push({
          metadata,
          imageSource,
          panelTokenId,
        });
      }

      return pagePanelsData;
    },
    [
      loadJSON,
      isPanelSold,
      loadImageSource,
      cachedTokenURIs,
      getPanelTokenUri,
      connectedAccount?.isPanelOwner,
    ],
  );

  return {
    getPageMetadata,
    getPagePanelsData,
    ipfsStatus: status,
  };
};

export default useNFNovelIpfsData;

import { createContext, useContext, useEffect, useState } from "react";
import { create as createIPFSClient } from "ipfs-core";
import { Page } from "src/types/page";
import { BigNumber } from "ethers";
import PanelOwnerService from "src/services/panel-owner-service";

import { NFNovelContext } from "./nfnovel-context";

import type { IPFS } from "ipfs-core";
import type { PanelMetadata } from "src/types/token";

export type ipfsURI = `ipfs://${string}`;
export type PanelData = {
  imageSource: string | null;
  metadata: PanelMetadata | null;
  panelTokenId: BigNumber | number;
};

export type PanelContext = {
  getPagePanelsData: (page: Page) => Promise<PanelData[]>;
};

const stripIpfsProtocol = (ipfsURI: ipfsURI) => ipfsURI.replace("ipfs://", "");

export const PanelContext = createContext<PanelContext | null>(null);

const WithPanelData = (props: { children?: React.ReactNode }) => {
  const { children } = props;
  const { nfnovel, connectedAccount } = useContext(NFNovelContext);

  const [ipfsClient, setIpfsClient] = useState<IPFS | null>(null);

  const cachedTokenURIs = new Map<BigNumber | number, string>();

  useEffect(() => {
    const loadIpfsClient = async () => {
      setIpfsClient(await createIPFSClient());
    };

    if (!ipfsClient) loadIpfsClient();
  }, [ipfsClient]);

  if (!nfnovel || !ipfsClient) {
    // THINK: render a Spinner if not available (during loading)
    return (
      <PanelContext.Provider value={null}>{children}</PanelContext.Provider>
    );
  }

  const getPanelMetadata = async (
    panelTokenId: BigNumber | number,
  ): Promise<PanelMetadata | null> => {
    const cachedPanelTokenURI = cachedTokenURIs.get(panelTokenId);

    const panelTokenURI = cachedPanelTokenURI ||
      (await nfnovel.tokenURI(panelTokenId).catch((error) => {
        console.error("error loading panel token URI", error.message);

        return null;
      }));

    if (!panelTokenURI) return null;
    // store it in cache if it exists
    cachedTokenURIs.set(panelTokenId, panelTokenURI);

    let panelMetadataString = "";
    try {
      for await (const panelMetadataChunk of ipfsClient.cat(
        // NOTE: strip protocol to just get CID
        stripIpfsProtocol(panelTokenURI as ipfsURI),
      )) {
        panelMetadataString +=
          Buffer.from(panelMetadataChunk).toString("utf-8");
      }
    } catch {
      console.error("failed to load metadata for", { panelTokenId });

      return null;
    }

    try {
      const panelTokenMetadata = JSON.parse(panelMetadataString);

      return panelTokenMetadata;
    } catch (error) {
      console.error("error parsing panel token metadata");

      return null;
    }
  };

  const getPanelImageSource = async (
    ipfsUri: ipfsURI,
  ): Promise<string | null> => {
    if (!ipfsUri) return null;

    let panelImageBlob = new Blob();
    try {
      for await (const panelImageChunk of ipfsClient.cat(
        // NOTE: strip protocol to just get CID
        stripIpfsProtocol(ipfsUri),
      )) {
        panelImageBlob = new Blob([panelImageBlob, panelImageChunk]);
      }
    } catch (error) {
      console.error("failed to load panel image", { error });

      return null;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
    return URL.createObjectURL(panelImageBlob);
  };

  const getPagePanelsData = async (page: Page): Promise<PanelData[]> => {
    const pagePanelsData = [];
    for (const panelTokenId of page.panelTokenIds) {
      const isSold = await PanelOwnerService.isPanelSold(nfnovel, panelTokenId);

      const shouldRequestRevealedMetadata = !page.isRevealed && connectedAccount?.isPanelOwner && isSold;

      const metadata = shouldRequestRevealedMetadata ?
        await PanelOwnerService.getRevealedPanelMetadata(panelTokenId) :
        await getPanelMetadata(panelTokenId);

      const imageSource = await getPanelImageSource(metadata?.image);

      pagePanelsData.push({
        panelTokenId,
        metadata,
        imageSource,
      });
    }

    return pagePanelsData;
  };

  return (
    <PanelContext.Provider value={{ getPagePanelsData }}>
      {children}
    </PanelContext.Provider>
  );
};

export default WithPanelData;

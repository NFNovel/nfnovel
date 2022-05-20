import { createContext, useContext, useEffect, useState } from "react";
import { create as createIPFSClient } from "ipfs-core";
import { Page } from "src/types/page";

import { NFNovelContext } from "./nfnovel-context";

import type { IPFS } from "ipfs-core";
import type { BigNumber } from "ethers";
import type { PanelMetadata } from "src/types/token";

export type ipfsURI = `ipfs://${string}`;
export type PanelData = {
  imageSource: string | null;
  metadata: PanelMetadata | null;
  panelTokenId: BigNumber | number;
};

export type PanelContext = {
  getPanelMetadata: (
    panelTokenId: BigNumber | number,
  ) => Promise<PanelMetadata | null>;
  getPanelImageSource: (
    panelTokenId: BigNumber | number,
  ) => Promise<string | null>;
  getPagePanelsData: (page: Page) => Promise<PanelData[]>;
};

const stripIpfsProtocol = (ipfsURI: ipfsURI) => ipfsURI.replace("ipfs://", "");

export const PanelContext = createContext<PanelContext | null>(null);

const WithPanelData = (props: { children?: React.ReactNode }) => {
  const { children } = props;
  const { nfnovel } = useContext(NFNovelContext);

  const [ipfsClient, setIpfsClient] = useState<IPFS | null>(null);

  const [cachedTokenURI, setCachedTokenURI] = useState<
  Map<BigNumber | number, string>
  >(new Map());

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
    const cachedPanelTokenURI = cachedTokenURI.get(panelTokenId);

    const panelTokenURI = cachedPanelTokenURI ||
      (await nfnovel.tokenURI(panelTokenId).catch((error) => {
        console.error("error loading panel token URI", error.message);

        return null;
      }));

    if (!panelTokenURI) return null;
    // store it in cache if it exists
    cachedTokenURI.set(panelTokenId, panelTokenURI);

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
    panelTokenId: BigNumber | number,
  ): Promise<string | null> => {
    const panelTokenMetadata = await getPanelMetadata(panelTokenId);
    if (!panelTokenMetadata) return null;

    let panelImageBlob = new Blob();
    try {
      for await (const panelImageChunk of ipfsClient.cat(
        // NOTE: strip protocol to just get CID
        stripIpfsProtocol(panelTokenMetadata.image),
      )) {
        panelImageBlob = new Blob([panelImageBlob, panelImageChunk]);
      }
    } catch {
      console.error("failed to load panel image for", { panelTokenId });

      return null;
    }

    // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
    return URL.createObjectURL(panelImageBlob);
  };

  const getPagePanelsData = async (page: Page): Promise<PanelData[]> => {
    const pagePanelsData = [];
    for (const panelTokenId of page.panelTokenIds) {
      const metadata = await getPanelMetadata(panelTokenId);
      const imageSource = await getPanelImageSource(panelTokenId);
      pagePanelsData.push({ panelTokenId, metadata, imageSource });
    }

    return pagePanelsData;
  };

  return (
    <PanelContext.Provider
      value={{ getPanelMetadata, getPanelImageSource, getPagePanelsData }}
    >
      {children}
    </PanelContext.Provider>
  );
};

export default WithPanelData;

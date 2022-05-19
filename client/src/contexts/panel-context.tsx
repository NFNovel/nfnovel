import { createContext, useContext, useEffect, useState } from "react";
import { create as createIPFSClient } from "ipfs-core";

import { NFNovelContext } from "./nfnovel-context";

import type { IPFS } from "ipfs-core";
import type { BigNumber } from "ethers";

export type ipfsURI = `ipfs://${string}`;

export type PanelMetadata = {
  name: string;
  external_url: string;
  description: string;
  image: ipfsURI;
  attributes: {
    trait_type: "height" | "width" | "page" | "panel";
    value: number | string | boolean;
  }[];
};

export type PanelContext = {
  getPanelMetadata: (
    panelTokenId: BigNumber | number,
  ) => Promise<PanelMetadata | null>;
  getPanelImageSource: (
    panelTokenId: BigNumber | number,
  ) => Promise<string | null>;
};

const stripIpfsProtocol = (ipfsURI: ipfsURI) => ipfsURI.replace("ipfs://", "");

export const PanelContext = createContext<PanelContext | null>(null);

const WithPanelData = (props: { children?: React.ReactNode }) => {
  const { children } = props;
  const { nfnovel } = useContext(NFNovelContext);

  const [ipfsClient, setIpfsClient] = useState<IPFS | null>(null);

  const panelMetadata: Map<BigNumber | number, PanelMetadata> = new Map();
  const panelImageSources: Map<BigNumber | number, string> = new Map();

  useEffect(() => {
    const loadIpfsClient = async () => {
      setIpfsClient(
        // await createIPFSClient({ repoOwner: true, repo: Date.now() + "" }),
        await createIPFSClient(),
      );
    };

    if (!ipfsClient) loadIpfsClient();
  }, [ipfsClient]);

  if (!nfnovel || !ipfsClient)
    return (
      <PanelContext.Provider value={null}>{children}</PanelContext.Provider>
    );

  const getPanelMetadata = async (
    panelTokenId: BigNumber | number,
  ): Promise<PanelMetadata | null> => {
    const storedMetadata = panelMetadata.get(panelTokenId);
    if (storedMetadata) return storedMetadata;

    const panelTokenURI = await nfnovel
      .tokenURI(panelTokenId)
      .catch((error) => {
        console.error("error loading panel token URI", error.message);

        return null;
      });

    if (!panelTokenURI) return null;

    let panelMetadataString = "";
    for await (const panelMetadataChunk of ipfsClient.cat(
      // NOTE: strip protocol to just get CID
      stripIpfsProtocol(panelTokenURI as ipfsURI),
      { timeout: 5 * 60 * 1000 },
    )) {
      panelMetadataString += Buffer.from(panelMetadataChunk).toString("utf-8");
    }

    try {
      const panelTokenMetadata = JSON.parse(panelMetadataString);
      panelMetadata.set(panelTokenId, panelTokenMetadata);

      return panelTokenMetadata;
    } catch (error) {
      console.error("error parsing panel token metadata");

      return null;
    }
  };

  const getPanelImageSource = async (
    panelTokenId: BigNumber | number,
  ): Promise<string | null> => {
    const storedImageSource = panelImageSources.get(panelTokenId);
    if (storedImageSource) return storedImageSource;

    const panelTokenMetadata = await getPanelMetadata(panelTokenId);
    if (!panelTokenMetadata) return null;

    console.log({
      panelTokenId,
      panelTokenMetadata,
    });

    let panelImageBase64 = "";
    for await (const panelImageChunk of ipfsClient.cat(
      // NOTE: strip protocol to just get CID
      stripIpfsProtocol(panelTokenMetadata.image),
    )) {
      panelImageBase64 += Buffer.from(panelImageChunk).toString("base64");
      console.log({ panelImageBase64 });
    }

    panelImageSources.set(panelTokenId, panelImageBase64);

    return panelImageBase64;
  };

  return (
    <PanelContext.Provider value={{ getPanelMetadata, getPanelImageSource }}>
      {children}
    </PanelContext.Provider>
  );
};

export default WithPanelData;

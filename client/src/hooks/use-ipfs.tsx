import { useCallback, useContext } from "react";

import { ipfsContext } from "src/contexts/ipfs-context";

import type { ipfsURI } from "src/types/token";

export const stripIpfsProtocol = (ipfsURI: ipfsURI) =>
  ipfsURI.replace("ipfs://", "");

export type UseIpfsOptions = { pinOnLoad?: boolean; throwOnError?: boolean };

/**
 * @note check status before calling functions
 * - if status !== "connected" then all functions will log error and throw or return null (@see options.throwOnError)
 * @param options
 * @param options.pinOnLoad [true] pin the file after loading
 * @param options.throwOnError [false] throw instead of returning null
 */
const useIpfs = (
  options: UseIpfsOptions = {
    pinOnLoad: true,
    throwOnError: false,
  },
) => {
  const { pinOnLoad, throwOnError } = options;

  const { ipfsNode, ipfsStatus } = useContext(ipfsContext);

  const loadString = useCallback(
    async (ipfsUri: ipfsURI): Promise<string | null> => {
      if (!ipfsNode) {
        console.error("IPFS node not connected, failed to load", ipfsUri);
        if (throwOnError) throw new Error("IPFS node not connected");

        return null;
      }

      let stringData = "";
      try {
        const jsonCID = stripIpfsProtocol(ipfsUri);

        for await (const panelMetadataChunk of ipfsNode.cat(jsonCID)) {
          stringData += Buffer.from(panelMetadataChunk).toString("utf-8");
        }

        // NOTE: pin the CID for faster loads in future and for others connecting to the site!
        if (pinOnLoad) await ipfsNode.pin.add(jsonCID);

        return stringData;
      } catch (error) {
        console.error("failed to load IPFS JSON for", ipfsUri, error);
        if (throwOnError) throw error;

        return null;
      }
    },
    [ipfsNode, pinOnLoad, throwOnError],
  );

  /**
   * uses @see loadString and parses output as JSON to return an object
   * @param ipfsUri {ipfsURI} IPFS URI with or without ipfs:// protocol prefix
   * @note will strip the prefix automatically
   */
  const loadJSON = useCallback(
    async (ipfsUri: ipfsURI): Promise<any | null> => {
      const jsonStringData = await loadString(ipfsUri);
      if (!jsonStringData) return null;

      try {
        const json = JSON.parse(jsonStringData);

        return json;
      } catch (error) {
        console.error("error parsing IPFS JSON", ipfsUri);

        if (throwOnError) throw error;

        return null;
      }
    },
    [loadString, throwOnError],
  );

  /**
   * Loads an image from IPFS and converts it to an ObjectURL to be used as an \<img src\> value
   * @see [URL.createObjectURL](https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL)
   * @param ipfsUri {ipfsURI} IPFS URI with or without ipfs:// protocol prefix
   * @note will strip the prefix automatically
   */
  const loadImageSource = useCallback(
    async (ipfsUri: ipfsURI): Promise<string | null> => {
      if (!ipfsNode) {
        console.error("IPFS node not connected, failed to load", ipfsUri);
        if (throwOnError) throw new Error("IPFS node not connected");

        return null;
      }

      let imageBlob = new Blob();
      try {
        const imageSourceCID = stripIpfsProtocol(ipfsUri);

        for await (const panelImageChunk of ipfsNode.cat(imageSourceCID)) {
          imageBlob = new Blob([imageBlob, panelImageChunk]);
        }

        // NOTE: pin the CID for faster loads in future and for others connecting to the site!
        if (pinOnLoad) await ipfsNode.pin.add(imageSourceCID);
      } catch (error) {
        console.error("failed to load IPFS image for", ipfsUri, error);
        if (throwOnError) throw error;

        return null;
      }

      // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
      return URL.createObjectURL(imageBlob);
    },
    [ipfsNode, pinOnLoad, throwOnError],
  );

  return {
    loadJSON,
    loadString,
    loadImageSource,
    node: ipfsNode,
    status: ipfsStatus,
  };
};

export default useIpfs;

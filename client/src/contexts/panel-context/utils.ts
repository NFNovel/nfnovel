import type { IPFS } from "ipfs-core";
import type { ipfsURI, PanelMetadata } from "src/types/token";

export const stripIpfsProtocol = (ipfsURI: ipfsURI) =>
  ipfsURI.replace("ipfs://", "");

export const getPanelMetadata = async (
  ipfsNode: IPFS,
  panelTokenURI: ipfsURI | null,
): Promise<PanelMetadata | null> => {
  if (!panelTokenURI) return null;

  let panelMetadataString = "";
  try {
    const metadataCID = stripIpfsProtocol(panelTokenURI as ipfsURI);

    for await (const panelMetadataChunk of ipfsNode.cat(metadataCID)) {
      panelMetadataString += Buffer.from(panelMetadataChunk).toString("utf-8");
    }

    // NOTE: pin the CID for faster loads in future and for others connecting to the site!
    await ipfsNode.pin.add(metadataCID);
  } catch {
    console.error("failed to load metadata for", {
      panelTokenURI,
    });

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

export const getPanelImageSource = async (
  ipfsNode: IPFS,
  ipfsUri: ipfsURI | null,
): Promise<string | null> => {
  if (!ipfsUri) return null;

  let panelImageBlob = new Blob();
  try {
    const imageSourceCID = stripIpfsProtocol(ipfsUri);

    for await (const panelImageChunk of ipfsNode.cat(imageSourceCID)) {
      panelImageBlob = new Blob([panelImageBlob, panelImageChunk]);
    }

    // NOTE: pin the CID for faster loads in future and for others connecting to the site!
    await ipfsNode.pin.add(imageSourceCID);
  } catch (error) {
    console.error("failed to load panel image", { error });

    return null;
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL
  return URL.createObjectURL(panelImageBlob);
};

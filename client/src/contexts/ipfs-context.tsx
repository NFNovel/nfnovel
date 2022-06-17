import { IPFS } from "ipfs-core";
import { create as createIpfsNode } from "ipfs-core";
import React, { createContext, useEffect, useState } from "react";

import useToastMessage from "src/hooks/use-toast-message";

import type { IDResult } from "ipfs-core-types/src/root";

export type IpfsContext = {
  ipfsNode: IPFS | null;
  ipfsStatus: "connected" | "connecting" | "error";
  ipfsNodeDetails: IDResult | null;
};

export const ipfsContext = createContext<IpfsContext>({
  ipfsNode: null,
  ipfsNodeDetails: null,
  ipfsStatus: "connecting",
});

const IPFSProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;

  const { renderErrorToast } = useToastMessage({ duration: null });

  const [ipfsNode, setIpfsNode] = useState<IPFS | null>(null);
  const [ipfsNodeDetails, setIpfsNodeDetails] = useState<IDResult | null>(null);
  const [ipfsStatus, setIpfsStatus] = useState<
  "connected" | "connecting" | "error"
  >("connecting");

  useEffect(() => {
    if (ipfsStatus === "error") {
      renderErrorToast(
        "IPFS Error",
        "Unable to connect to IPFS (try refreshing)",
      );
    }
  }, [ipfsStatus, renderErrorToast]);

  useEffect(() => {
    const connectToIpfs = async () => {
      try {
        const ipfsNode = await createIpfsNode();
        const nodeDetails = await ipfsNode.id();

        setIpfsStatus("connected");
        setIpfsNode(ipfsNode);
        setIpfsNodeDetails(nodeDetails);
      } catch (error) {
        console.error("error connecting to IPFS", error);
        setIpfsStatus("error");
      }
    };

    if (!ipfsNode) connectToIpfs();
  }, [ipfsNode]);

  return (
    <ipfsContext.Provider
      value={{
        ipfsNode,
        ipfsStatus,
        ipfsNodeDetails,
      }}
    >
      {children}
    </ipfsContext.Provider>
  );
};

export default IPFSProvider;

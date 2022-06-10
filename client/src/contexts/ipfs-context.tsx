import { create as createIpfsNode } from "ipfs-core";
import { Spinner, ToastId, useToast } from "@chakra-ui/react";
import { IPFS } from "ipfs-core";
import React, { createContext, useEffect, useRef, useState } from "react";

type IpfsContext = {
  ipfsNode: IPFS | null;
  ipfsStatus: "connected" | "connecting" | "error";
};

export const ipfsContext = createContext<IpfsContext>({
  ipfsNode: null,
  ipfsStatus: "connecting",
});

const IPFSProvider = (props: { children: React.ReactNode }) => {
  const { children } = props;

  const statusToast = useToast({
    position: "bottom-left",
  });
  const statusToastRef = useRef<ToastId>();

  const [ipfsNode, setIpfsNode] = useState<IPFS | null>(null);
  const [ipfsStatus, setIpfsStatus] = useState<
  "connected" | "connecting" | "error"
  >("connecting");

  useEffect(() => {
    // use a ref to only show the connecting toast once
    if (!statusToastRef.current) {
      statusToastRef.current = statusToast({
        duration: null,
        icon: <Spinner />,
        description: "Connecting to IPFS...",
      });
    }

    switch (ipfsStatus) {
      case "connected":
        statusToast.update(statusToastRef.current, {
          duration: 5000,
          status: "success",
          description: "Connected to IPFS!",
        });
        break;
      case "error":
        statusToast.update(statusToastRef.current, {
          duration: null,
          status: "error",
          description: "Unable to connect to IPFS (try refreshing) :(",
        });
    }
  }, [ipfsStatus, statusToast]);

  useEffect(() => {
    const connectToIpfs = async () => {
      try {
        const ipfsNode = await createIpfsNode();

        setIpfsNode(ipfsNode);
        setIpfsStatus("connected");
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
      }}
    >
      {children}
    </ipfsContext.Provider>
  );
};

export default IPFSProvider;

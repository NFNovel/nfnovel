import { useConnect, useSigner } from "wagmi";
import {
  createContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Tag, Text } from "@chakra-ui/react";

import PanelOwnerService from "src/services/panel-owner-service";
import useToastMessage from "src/hooks/use-toast-message";

import type { BigNumber, Signer } from "ethers";

export interface IConnectedAccount {
  address: string;
  signer: Signer;
  isPanelOwner: boolean;
  ownedPanelTokenIds: (BigNumber | number)[];
}

export interface IConnectedAccountContext {
  connectedAccount: IConnectedAccount | null;
  updateConnectedAccount: () => Promise<void>;
}

export const ConnectedAccountContext = createContext<IConnectedAccountContext>({
  connectedAccount: null,
  updateConnectedAccount: async () => {
    return;
  },
});

const ConnectedAccountProvider = (props: { children?: React.ReactNode }) => {
  const { children } = props;

  const { data: signer } = useSigner();

  const { renderErrorToast, renderSuccessToast } = useToastMessage({});
  const { status: walletStatus, activeConnector: activeWallet } = useConnect();

  const [connectedAccount, setConnectedAccount] = useState<IConnectedAccount | null>(null);

  // great tip to prevent needless re-rendering!
  // https://kentcdodds.com/blog/application-state-management-with-react
  const connectedAccountMemo = useMemo(
    () => ({ connectedAccount }),
    [connectedAccount],
  );

  const updateConnectedAccount = useCallback(async () => {
    if (!signer) return setConnectedAccount(null);

    const address = await signer.getAddress();

    const ownedPanelTokenIds = await PanelOwnerService.getOwnedPanelTokenIds(
      address,
    );

    const connectedAccount: IConnectedAccount = {
      signer,
      address,
      ownedPanelTokenIds,
      isPanelOwner: ownedPanelTokenIds.length > 0,
    };

    setConnectedAccount(connectedAccount);
  }, [signer]);

  useEffect(() => {
    updateConnectedAccount();
  }, [updateConnectedAccount, connectedAccount?.signer]);

  useEffect(() => {
    if (connectedAccount?.address) {
      if (walletStatus === "connected") {
        renderSuccessToast(
          `${activeWallet?.name} Wallet`,
          <Text>
            Connected as{" "}
            <Tag
              variant={"solid"}
              color="black"
            >
              {connectedAccount.address.slice(0, 6)}...
            </Tag>
          </Text>,
        );
      }

      if (walletStatus === "disconnected") {
        renderErrorToast(
          "Wallet Disconnected",
          "Check your wallet, it may have become locked",
        );
      }
    }
  }, [
    walletStatus,
    activeWallet,
    renderErrorToast,
    renderSuccessToast,
    connectedAccount,
  ]);

  return (
    <ConnectedAccountContext.Provider
      value={{
        updateConnectedAccount,
        connectedAccount: connectedAccountMemo.connectedAccount,
      }}
    >
      {children}
    </ConnectedAccountContext.Provider>
  );
};

export default ConnectedAccountProvider;

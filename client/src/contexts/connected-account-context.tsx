import { useConnect, useProvider, useSigner } from "wagmi";
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
  signer: Signer | null;
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

  const { data: activeSigner } = useSigner();
  const { network: providerNetwork } = useProvider();
  const { activeConnector: activeWallet } = useConnect();

  const { renderSuccessToast } = useToastMessage({});

  const [connectedAccount, setConnectedAccount] = useState<IConnectedAccount | null>(null);

  // great tip to prevent needless re-rendering!
  // https://kentcdodds.com/blog/application-state-management-with-react
  const connectedAccountMemo = useMemo(
    () => ({ connectedAccount }),
    [connectedAccount],
  );

  const updateConnectedAccount = useCallback(async () => {
    if (!activeWallet) return setConnectedAccount(null);

    const address = await activeWallet.getAccount();

    const activeWalletChainId = await activeWallet.getChainId();
    const signer = activeWalletChainId === providerNetwork.chainId && activeSigner ?
      activeSigner :
      null;

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

    renderSuccessToast(
      `${activeWallet?.name} Wallet`,
      <Text>
        Connected as{" "}
        <Tag
          variant={"solid"}
          color="black"
        >
          {address.slice(0, 6)}...
        </Tag>
      </Text>,
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWallet, activeSigner, providerNetwork]);

  useEffect(() => {
    updateConnectedAccount();
  }, [updateConnectedAccount]);

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

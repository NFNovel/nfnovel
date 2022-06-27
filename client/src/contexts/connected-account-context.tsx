import { useConnect, useProvider, useSigner } from "wagmi";
import {
  createContext,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { Tag, Text } from "@chakra-ui/react";

import useNFNovel from "src/hooks/use-nfnovel";
import PanelOwnerService from "src/services/panel-owner-service";
import useToastMessage from "src/hooks/use-toast-message";

import type { BigNumberish, Signer } from "ethers";

export interface IConnectedAccount {
  address: string;
  signer: Signer | null;
  isPanelOwner: boolean;
  ownedPanelTokenIds: BigNumberish[];
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

  const { nfnovelReader } = useNFNovel();
  const { renderSuccessToast } = useToastMessage({});

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
      nfnovelReader,
      address,
    );

    const connectedAccount: IConnectedAccount = {
      signer,
      address,
      ownedPanelTokenIds,
      isPanelOwner: ownedPanelTokenIds.length > 0,
    };

    setConnectedAccount(connectedAccount);
  }, [signer, nfnovelReader]);

  useEffect(() => {
    updateConnectedAccount();
  }, [updateConnectedAccount]);

  useEffect(() => {
    if (connectedAccount?.address)
      renderSuccessToast(
        "Connected As",
        <Tag
          variant={"solid"}
          color="black"
        >
          {connectedAccount.address}
        </Tag>,
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [connectedAccount?.address]);

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

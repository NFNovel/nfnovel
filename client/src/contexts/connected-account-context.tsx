import { useSigner } from "wagmi";
import { createContext, useState, useMemo, useEffect } from "react";
import PanelOwnerService from "src/services/panel-owner-service";

import type { BigNumber, Signer } from "ethers";

export interface IConnectedAccount {
  address: string;
  signer: Signer;
  isPanelOwner: boolean;
  ownedPanelTokenIds: (BigNumber | number)[];
}

export const ConnectedAccountContext = createContext<{
  connectedAccount: IConnectedAccount | null;
}>({
  connectedAccount: null,
});

const ConnectedAccountProvider = (props: { children?: React.ReactNode }) => {
  const { children } = props;

  const { data: signer } = useSigner();
  const [connectedAccount, setConnectedAccount] = useState<IConnectedAccount | null>(null);

  // great tip to prevent needless re-rendering!
  // https://kentcdodds.com/blog/application-state-management-with-react
  const value = useMemo(() => ({ connectedAccount }), [connectedAccount]);

  useEffect(() => {
    const updateConnectedAccount = async () => {
      if (!signer) return;

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
    };

    updateConnectedAccount();
  }, [signer]);

  return (
    <ConnectedAccountContext.Provider value={value}>
      {children}
    </ConnectedAccountContext.Provider>
  );
};

export default ConnectedAccountProvider;

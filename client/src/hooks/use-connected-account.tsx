import { useAccount } from "wagmi";
import { useEffect, useState } from "react";
import PanelOwnerService from "src/services/panel-owner-service";

import type { BigNumber } from "ethers";

export interface IConnectedAccount {
  address: string;
  isPanelOwner: boolean;
  ownedPanelTokenIds: (BigNumber | number)[];
}

const useConnectedAccount = (): IConnectedAccount | null => {
  const { data: account } = useAccount();
  const [connectedAccount, setConnectedAccount] = useState<IConnectedAccount | null>(null);

  useEffect(() => {
    const updateConnectedAccount = async () => {
      if (!account || !account.address) return;

      const { address } = account;

      console.log("updating connected account");

      const ownedPanelTokenIds = await PanelOwnerService.getOwnedPanelTokenIds(
        address,
      );

      const connectedAccount: IConnectedAccount = {
        address,
        ownedPanelTokenIds,
        isPanelOwner: ownedPanelTokenIds.length > 0,
      };

      console.log({ connectedAccount });

      setConnectedAccount(connectedAccount);
    };

    updateConnectedAccount();
  }, [account]);

  return connectedAccount;
};

export default useConnectedAccount;

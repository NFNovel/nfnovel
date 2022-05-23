import PanelOwnerService from "src/services/panel-owner-service";

import type { Web3Provider } from "@ethersproject/providers";
import type { IConnectedAccount } from "src/contexts/nfnovel-context";

export const connectToMetamask = async (
  metamaskProvider: Web3Provider,
): Promise<IConnectedAccount | null> => {
  try {
    await metamaskProvider.send("eth_requestAccounts", []);

    const signer = await metamaskProvider.getSigner();
    const address = await signer.getAddress();
    const ownedPanelTokenIds = await PanelOwnerService.getOwnedPanelTokenIds(
      address,
    );

    const connectedAccount: IConnectedAccount = {
      signer,
      address,
      isPanelOwner: false,
    };

    if (ownedPanelTokenIds.length) connectedAccount.isPanelOwner = true;

    return connectedAccount;
  } catch {
    return null;
  }
};

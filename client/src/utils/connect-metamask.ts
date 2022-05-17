import type { Web3Provider } from "@ethersproject/providers";
import type { IConnectedAccount } from "src/contexts/nfnovel-context";

export const connectToMetamask = async (
  metamaskProvider: Web3Provider,
): Promise<IConnectedAccount | null> => {
  try {
    await metamaskProvider.send("eth_requestAccounts", []);

    const signer = await metamaskProvider.getSigner();
    const address = await signer.getAddress();

    return { signer, address };
  } catch {
    return null;
  }
};

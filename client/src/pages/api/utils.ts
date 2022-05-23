import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider();

export function getContract<TContract>(
  contractAbi: ethers.ContractInterface,
  contractAddress: string,
) {
  return new ethers.Contract(
    contractAddress,
    contractAbi,
    provider,
  ) as unknown as TContract;
}

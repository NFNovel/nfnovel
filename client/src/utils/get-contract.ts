import { ethers } from "ethers";

const provider = new ethers.providers.JsonRpcProvider();

function getContract<TContract>(
  contractAbi: ethers.ContractInterface,
  contractAddress: string,
) {
  return new ethers.Contract(
    contractAddress,
    contractAbi,
    provider,
  ) as unknown as TContract;
}

export default getContract;

import { ethers } from "ethers";

const localhost = "http://127.0.0.1:8545";

const provider = new ethers.providers.JsonRpcProvider(localhost);

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

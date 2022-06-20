import { ethers } from "ethers";

import { provider } from "src/config/wagmi";

function getContract<TContract>(
  contractAbi: ethers.ContractInterface,
  contractAddress: string,
  chainId: number,
) {
  return new ethers.Contract(
    contractAddress,
    contractAbi,
    provider({ chainId }),
  ) as unknown as TContract;
}

export default getContract;

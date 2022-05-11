import { ethers } from "hardhat";

import { Signer, Contract, BigNumber, utils } from "ethers";
import type { NFNovel, NFNovels } from "../typechain";

/**
 * Deploys a contract and returns an instance of it for tests
 * @param ownerAccount the signer that deploys the contract
 * @param constructorArgs optional args to pass to .deploy()
 */
const deployTestContract = async <TContract extends Contract>(
  contractName: string,
  ownerAccount: Signer,
  ...constructorArgs: unknown[]
): Promise<TContract> => {
  const ContractFactory = await ethers.getContractFactory(contractName);

  const contract = await ContractFactory.connect(ownerAccount).deploy(
    ...constructorArgs
  );

  await contract.deployed();

  return contract as TContract;
};

export const deployNFNovelTestContract = (
  ownerAccount: Signer,
  ...constructorArgs: unknown[]
): Promise<NFNovel> =>
  deployTestContract<NFNovel>("NFNovel", ownerAccount, ...constructorArgs);

export const deployNFNovelsTestContract = (
  ownerAccount: Signer,
  ...constructorArgs: unknown[]
): Promise<NFNovels> =>
  deployTestContract<NFNovels>("NFNovels", ownerAccount, ...constructorArgs);

/**
 * Destructure as many accounts as needed for tests
 * @note the first signer is the default signing account (if none is specified when deploying or calling a contract)
 *
 * For just signers:
 * @example
 * ```js
 * [[firstSigner], [secondSigner], ...] = await getTestSigningAccounts();
 * ```
 *
 * For signers and their addresses
 * @example
 * ```js
 * [
 *  [firstSigner, firstSignerAddress],
 *  [secondSigner, secondSignerAddress],
 *  ...
 * ] = await getTestSigningAccounts();
 * ```
 *
 * @returns signer and address pairs
 */
export const getTestSigningAccounts: () => Promise<
  [Signer, string][]
> = async () => {
  const signers = await ethers.getSigners();

  return Promise.all(
    signers.map(async (signer) => [signer, await signer.getAddress()])
  );
};

export const computeInterfaceId = (
  contractInterface: utils.Interface
): string =>
  Object.keys(contractInterface.functions)
    .reduce(
      (interfaceId, contractFunction) =>
        interfaceId.xor(contractInterface.getSighash(contractFunction)),
      BigNumber.from(0)
    )
    .toHexString();

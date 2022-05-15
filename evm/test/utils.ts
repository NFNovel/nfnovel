import { expect } from "chai";
import { ethers } from "hardhat";
import { Signer, Contract, BigNumber, utils } from "ethers";

import type { NFNovel, NFNovels } from "../typechain";
import type { Block } from "@ethersproject/providers";

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
  title: string,
  symbol: string
): Promise<NFNovel> =>
  deployTestContract<NFNovel>("NFNovel", ownerAccount, title, symbol);

export const deployNFNovelsTestContract = (
  ownerAccount: Signer
): Promise<NFNovels> => deployTestContract<NFNovels>("NFNovels", ownerAccount);

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
  contractInterface: utils.Interface,
  ...extendedInterfaces: utils.Interface[]
): string => {
  const functions = extendedInterfaces.length
    ? // if extended interfaces are included then merge all function signatures together[
      [
        ...Object.keys(contractInterface.functions),
        ...extendedInterfaces.reduce(
          (extendedFunctions: string[], extendedInterface) => [
            ...extendedFunctions,
            ...Object.keys(extendedInterface.functions),
          ],
          []
        ),
      ]
    : // otherwise just use functions from the individual contract interface
      Object.keys(contractInterface.functions);

  return functions
    .reduce((interfaceId, contractFunction) => {
      return interfaceId.xor(contractInterface.getSighash(contractFunction));
    }, BigNumber.from(0))
    .toHexString();
};

export const getCurrentBlock = async (): Promise<Block> => {
  const currentBlockNumber = await ethers.provider.getBlockNumber();
  const currentBlock = await ethers.provider.getBlock(currentBlockNumber);

  return currentBlock;
};

/**
 * Simulates the passage of time by mining the next block with a number of seconds added to the current block timestamp
 * @param secondsToAdd the number of seconds to add to block.timestamp
 */
export const addBlockTime = async (
  secondsToAdd: number | BigNumber
): Promise<void> => {
  const currentBlock = await getCurrentBlock();

  const currentTimestamp = currentBlock.timestamp;
  const nextBlockTimestamp = BigNumber.isBigNumber(secondsToAdd)
    ? secondsToAdd.add(currentTimestamp).toNumber()
    : currentTimestamp + secondsToAdd;

  // https://ethereum.stackexchange.com/a/112809
  // https://github.com/trufflesuite/ganache-cli-archive/commit/6c0d5820bc3634fa00cbeb2bd97ad721066761a5
  // (as noted in thread) this is a ganache setting but hardhat implements it too
  await ethers.provider.send("evm_mine", [nextBlockTimestamp]);
};

/**
 * Bids on behalf of the winner account and ends the auction using @see addBlockTime
 * @param nfnovelContract
 * @param settings
 */
export const setPanelAuctionWinner = async (
  nfnovelContract: NFNovel,
  settings: {
    winner: Signer;
    panelTokenId: number | BigNumber;
    panelAuctionId?: number | BigNumber;
    bidAmount?: number | BigNumber;
    auctionDurationSeconds?: number | BigNumber;
  }
): Promise<{ bid: number | BigNumber; winner: Signer }> => {
  const {
    winner,
    bidAmount,
    panelTokenId,
    panelAuctionId,
    auctionDurationSeconds,
  } = settings;

  const auctionDuration =
    auctionDurationSeconds ||
    (await nfnovelContract.auctionDefaults()).duration;

  const auctionId =
    panelAuctionId || (await nfnovelContract.getPanelAuctionId(panelTokenId));

  const bid = bidAmount || ethers.constants.WeiPerEther.mul(1);

  const panelAuction = await nfnovelContract.auctions(auctionId);
  expect(panelAuction.highestBid).to.be.lt(bid);

  await nfnovelContract.connect(winner).placeBid(auctionId, { value: bid });

  await addBlockTime(auctionDuration);

  await nfnovelContract.endPanelAuction(panelTokenId);

  return {
    bid,
    winner,
  };
};

/**
 * Ends the panel auction with the panelOwner as the winner (using @see setPanelAuctionWinner) and mints the panel to them
 */
export const mintPagePanel = async (
  nfnovelContract: NFNovel,
  panelOwner: Signer,
  panelTokenId: number | BigNumber
): Promise<void> => {
  // end panel auction
  await setPanelAuctionWinner(nfnovelContract, {
    panelTokenId,
    winner: panelOwner,
  });

  // mint the panel so reveal page will succeed
  await nfnovelContract.connect(panelOwner).mintPanel(panelTokenId);
};

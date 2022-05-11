import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber, utils } from "ethers";
import {
  computeInterfaceId,
  getTestSigningAccounts,
  deployNFNovelTestContract,
} from "./utils";
import { INTERFACE_IDS } from "./constants";
// eslint-disable-next-line camelcase
import { Ownable__factory } from "../typechain/factories/Ownable__factory";
// eslint-disable-next-line camelcase
import { Auctionable__factory } from "../typechain/factories/Auctionable__factory";

import type { Signer } from "ethers";
import type { NFNovel } from "../typechain";

export const getInterfaceID = (
  contractInterface: utils.Interface
): BigNumber => {
  let interfaceID: BigNumber = ethers.constants.Zero;
  const functions: string[] = Object.keys(contractInterface.functions);

  for (let i = 0; i < functions.length; i++) {
    interfaceID = interfaceID.xor(contractInterface.getSighash(functions[i]));
  }

  return interfaceID;
};

describe("NFNovel", () => {
  let ownerAccount: Signer;
  let ownerAccountAddress: string;

  before(async () => {
    [[ownerAccount, ownerAccountAddress]] = await getTestSigningAccounts();
  });

  describe("Interfaces", () => {
    let nfnovelContract: NFNovel;
    before(async () => {
      nfnovelContract = await deployNFNovelTestContract(
        ownerAccount,
        "Novel",
        "NFN-1"
      );
    });

    it("is ERC-721", async () =>
      expect(await nfnovelContract.supportsInterface(INTERFACE_IDS.ERC721)).to
        .be.true);

    it("is Ownable", async () => {
      const ownableInterface = Ownable__factory.createInterface();
      const ownableInterfaceId = computeInterfaceId(ownableInterface);

      expect(await nfnovelContract.supportsInterface(ownableInterfaceId));
    });

    it("is Auctionable", async () => {
      const auctionableInterface = Auctionable__factory.createInterface();
      const auctionableInterfaceId = computeInterfaceId(auctionableInterface);

      expect(await nfnovelContract.supportsInterface(auctionableInterfaceId));
    });
  });
});

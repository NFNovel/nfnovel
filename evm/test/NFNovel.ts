import { expect } from "chai";
import type { Signer } from "ethers";
import { ethers } from "hardhat";
import { BigNumber, utils } from "ethers";
import { deployNFNovelTestContract, getTestSigningAccounts } from "./utils";
import { INTERFACE_IDS } from "./constants";

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

  it("conforms to ERC-721 spec", async () => {
    const nfnovelConract = await deployNFNovelTestContract(
      ownerAccount,
      "Novel",
      "NFN-1"
    );

    expect(await nfnovelConract.supportsInterface(INTERFACE_IDS.ERC721)).to.be
      .true;
  });
});

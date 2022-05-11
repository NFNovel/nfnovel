import { expect } from "chai";
import {
  computeInterfaceId,
  getTestSigningAccounts,
  deployNFNovelTestContract,
} from "../utils";
import { OZ_INTERFACE_IDS } from "../constants";
// eslint-disable-next-line camelcase
import { Ownable__factory } from "../../typechain/factories/Ownable__factory";
// eslint-disable-next-line camelcase
import { Auctionable__factory } from "../../typechain/factories/Auctionable__factory";

import type { Signer } from "ethers";
import type { NFNovel } from "../../typechain";
import { ERC721__factory } from "../../typechain/factories/ERC721__factory";
import { IERC721Metadata__factory } from "../../typechain/factories/IERC721Metadata__factory";

describe("NFNovel: Interfaces", () => {
  let ownerAccount: Signer;

  before(async () => {
    [[ownerAccount]] = await getTestSigningAccounts();
  });

  let nfnovelContract: NFNovel;
  before(async () => {
    nfnovelContract = await deployNFNovelTestContract(
      ownerAccount,
      "Novel",
      "NFN-1"
    );
  });

  it("is ERC-721", async () =>
    expect(await nfnovelContract.supportsInterface(OZ_INTERFACE_IDS.ERC721)).to
      .be.true);

  it("is Ownable", async () => {
    const ownableInterface = Ownable__factory.createInterface();
    const ownableInterfaceId = computeInterfaceId(ownableInterface);

    expect(await nfnovelContract.supportsInterface(ownableInterfaceId)).to.be
      .true;
  });

  it("is Auctionable", async () => {
    const ownableInterface = Ownable__factory.createInterface();
    const auctionableInterface = Auctionable__factory.createInterface();

    // Auctionable is Ownable, must compute with both
    const auctionableInterfaceId = computeInterfaceId(
      auctionableInterface,
      ownableInterface
    );

    expect(await nfnovelContract.supportsInterface(auctionableInterfaceId)).to
      .be.true;
  });
});

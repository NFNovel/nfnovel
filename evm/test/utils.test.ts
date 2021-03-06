import { expect } from "chai";

import {
  mintSinglePagePanel,
  addBlockTime,
  getCurrentBlock,
  getTestSigningAccounts,
  deployNFNovelTestContract,
  setPanelAuctionWinner,
  mintMultiplePagePanels,
} from "./utils";
import { BigNumber } from "ethers";

import type { Signer } from "ethers";
import type { NFNovel } from "../typechain/NFNovel";

describe("Test utils", () => {
  describe("addBlockTime: increments the block timestamp by the number of seconds passed", () => {
    const testAddBlockTime = async (secondsToAdd: number | BigNumber) => {
      const blockTimestamp = (await getCurrentBlock()).timestamp;
      const expectedTimestamp = BigNumber.isBigNumber(secondsToAdd)
        ? secondsToAdd.add(blockTimestamp)
        : secondsToAdd + blockTimestamp;

      await addBlockTime(secondsToAdd);

      expect((await getCurrentBlock()).timestamp).to.eq(expectedTimestamp);
    };

    it("works with number", () => testAddBlockTime(500));
    it("works with BigNumber", () => testAddBlockTime(BigNumber.from(500)));
  });

  describe("setPanelAuctionWinner", () => {
    let nfnovelContract: NFNovel;
    let owner: Signer, winner: Signer;
    let winnerAddress: string;

    let output: unknown;
    // minimal Auction struct type def
    let panelAuction: { highestBidder: string; state: number | BigNumber };

    before(async () => {
      [[owner], [winner, winnerAddress]] = await getTestSigningAccounts();
      nfnovelContract = await deployNFNovelTestContract(owner, "Title", "SYM");

      await nfnovelContract.addPage(1, "obscured");

      output = await setPanelAuctionWinner(nfnovelContract, {
        winner,
        panelTokenId: 1,
      });

      panelAuction = await nfnovelContract.auctions(1);
    });

    it("the highest bidder of the auction is the winner", () =>
      expect(panelAuction.highestBidder).to.hexEqual(winnerAddress));

    it("returns the winner and winning bid", () => {
      expect(output).to.haveOwnProperty("bid");
      expect(output).to.haveOwnProperty("winner");
    });
  });

  describe("mintSinglePagePanel", () => {
    let nfnovelContract: NFNovel;
    let owner: Signer, panelOwner: Signer;
    let panelOwnerAddress: string;

    before(async () => {
      [[owner], [panelOwner, panelOwnerAddress]] =
        await getTestSigningAccounts();
      nfnovelContract = await deployNFNovelTestContract(owner, "Title", "SYM");

      await nfnovelContract.addPage(1, "obscured");

      await mintSinglePagePanel(nfnovelContract, panelOwner, 1);
    });

    it("mints the panel to the panelOwner account", async () =>
      expect(await nfnovelContract.ownerOf(1)).to.hexEqual(panelOwnerAddress));
  });

  describe("mintMultiplePagePanels", () => {
    let nfnovelContract: NFNovel;
    let owner: Signer, panelOwner: Signer;
    let panelOwnerAddress: string;

    const panelTokenIds = [1, 2];

    before(async () => {
      [[owner], [panelOwner, panelOwnerAddress]] =
        await getTestSigningAccounts();
      nfnovelContract = await deployNFNovelTestContract(owner, "Title", "SYM");

      await nfnovelContract.addPage(2, "obscured");

      await mintMultiplePagePanels(nfnovelContract, panelOwner, panelTokenIds);
    });

    it("mints all the panels to the panelOwner account", async () => {
      for (const panelTokenId of panelTokenIds) {
        expect(await nfnovelContract.ownerOf(panelTokenId)).to.hexEqual(
          panelOwnerAddress
        );
      }
    });
  });
});

import { expect } from "chai";

import {
  mintPagePanel,
  addBlockTime,
  getCurrentBlock,
  getTestSigningAccounts,
  deployNFNovelTestContract,
  setPanelAuctionWinner,
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

    it("ends the auction", async () => {
      // Auction/structures.sol: AuctionStates enum, Ended is index 2
      expect(panelAuction.state).to.eq(2);
    });

    it("the highest bidder of the auction is the winner", () =>
      expect(panelAuction.highestBidder).to.hexEqual(winnerAddress));

    it("returns the winner and winning bid", () => {
      expect(output).to.haveOwnProperty("bid");
      expect(output).to.haveOwnProperty("winner");
    });
  });

  describe("mintPagePanel", () => {
    let nfnovelContract: NFNovel;
    let owner: Signer, panelOwner: Signer;
    let panelOwnerAddress: string;

    before(async () => {
      [[owner], [panelOwner, panelOwnerAddress]] =
        await getTestSigningAccounts();
      nfnovelContract = await deployNFNovelTestContract(owner, "Title", "SYM");

      await nfnovelContract.addPage(1, "obscured");

      await mintPagePanel(nfnovelContract, panelOwner, 1);
    });

    it("mints the panel to the panelOwner account", async () =>
      expect(await nfnovelContract.ownerOf(1)).to.hexEqual(panelOwnerAddress));
  });
});

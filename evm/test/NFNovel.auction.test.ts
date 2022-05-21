import { expect } from "chai";
import { ethers, BigNumber } from "ethers";
import {
  getTestSigningAccounts,
  deployNFNovelTestContract,
  setBlockToAuctionEndTime,
} from "./utils";

import type { Signer } from "ethers";
import type { NFNovel } from "../typechain";

describe("NFNovel [Auctionable]: Panel Auctions", () => {
  let owner: Signer;
  let ownerAddress: string;
  let nonOwner: Signer;
  let nonOwnerAddress: string;
  let bidder: Signer;
  let bidderAddress: string;

  before(async () => {
    [
      [owner, ownerAddress],
      [nonOwner, nonOwnerAddress],
      [bidder, bidderAddress],
    ] = await getTestSigningAccounts();
  });

  describe("placeBid", () => {
    let nfnovelContract: NFNovel;
    let auction: { id: BigNumber; endTime: BigNumber };

    const panelsCount = 1;
    const panelTokenId = 1;
    const panelAuctionId = panelTokenId;
    const obscuredBaseURI = "ipfs://obscured";
    const auctionStartingValue = ethers.constants.WeiPerEther.mul(2);

    before(async () => {
      nfnovelContract = await deployNFNovelTestContract(
        owner,
        "Mysterio",
        "NFN-1"
      );

      // set a starting value
      await nfnovelContract.setAuctionDefaults({
        duration: 30,
        startingValue: auctionStartingValue,
        minimumBidValue: 0,
      });

      await nfnovelContract.addPage(panelsCount, obscuredBaseURI);
      auction = await nfnovelContract.auctions(panelAuctionId);
    });

    context("reverts", () => {
      it("with BidBelowStartingValue if the bid is lower than the startingValue", () =>
        expect(
          nfnovelContract.placeBid(panelAuctionId, {
            // set a value below starting value
            value: auctionStartingValue.div(2),
          })
        ).to.be.revertedWith("BidBelowStartingValue"));

      // NOTE: this test that speeds up block time must come after any that need an Active auction
      it("with AuctionNoteActive if the auction end time has passed", async () => {
        // simulate passing end time
        await setBlockToAuctionEndTime(auction.endTime);

        await expect(
          nfnovelContract.placeBid(panelTokenId, {
            // set a value above starting value
            value: auctionStartingValue.mul(2),
          })
        ).to.be.revertedWith("AuctionNotActive");
      });
    });
  });

  describe("withdrawBid", () => {
    context("reverts", () => {
      it("with NoBidToWithdraw if there is no bid value for the caller", async () => {
        const nfnovelContract = await deployNFNovelTestContract(
          owner,
          "title",
          "SYM"
        );

        await nfnovelContract.addPage(1, "");

        return expect(
          nfnovelContract.connect(bidder).withdrawBid(1)
        ).to.be.revertedWith("NoBidToWithdraw");
      });

      it("with CannotWithdrawHighestBid if the caller is the highest bidder", async () => {
        const nfnovelContract = await deployNFNovelTestContract(
          owner,
          "title",
          "SYM"
        );

        await nfnovelContract.addPage(1, "");

        await nfnovelContract.connect(bidder).placeBid(1, {
          value: ethers.constants.WeiPerEther.mul(3),
        });

        // confirm they are the highest bidder
        expect(
          (await nfnovelContract.auctions(1)).highestBidder
        ).to.be.hexEqual(bidderAddress);

        return expect(
          nfnovelContract.connect(bidder).withdrawBid(1)
        ).to.be.revertedWith("CannotWithdrawHighestBid");
      });
    });

    it("transfers the total unused bid value from the contract to the non-highest bidder", async () => {
      const nonHighestBidderAccount = nonOwner;
      const nonHighestBidderAddress = nonOwnerAddress;
      const nonHighestBidWei = ethers.constants.WeiPerEther.mul(2);

      const highestBidderAccount = bidder;
      const highestBidWei = ethers.constants.WeiPerEther.mul(3);

      const nfnovelContract = await deployNFNovelTestContract(
        owner,
        "title",
        "SYM"
      );

      await nfnovelContract.addPage(1, "");

      await nfnovelContract.connect(nonHighestBidderAccount).placeBid(1, {
        value: nonHighestBidWei,
      });

      await nfnovelContract.connect(highestBidderAccount).placeBid(1, {
        value: highestBidWei,
      });

      // confirm they are not the highest bidder
      expect(
        (await nfnovelContract.auctions(1)).highestBidder
      ).not.to.be.hexEqual(nonHighestBidderAddress);

      await expect(
        await nfnovelContract.connect(nonHighestBidderAccount).withdrawBid(1)
      ).to.changeEtherBalances(
        [nfnovelContract, nonHighestBidderAccount],
        // contract loses (mul(-1)) value, non highest bidder gains value
        [nonHighestBidWei.mul(-1), nonHighestBidWei]
      );
    });
  });

  describe("view functions", () => {
    describe("checkBid", () => {
      let nfnovelContract: NFNovel;
      before(async () => {
        nfnovelContract = await deployNFNovelTestContract(
          owner,
          "title",
          "SYM"
        );

        await nfnovelContract.addPage(1, "");
      });

      // in this one check with no bids placed
      it("returns 0 if the caller does not have any bid value in the auction", async () =>
        expect(await nfnovelContract.checkBid(1)).to.eq(0));

      // NOTE: coupled to previous test (must come after 0 expected bid value)
      it("returns the current bid value of the caller", async () => {
        const bidAmountWei = ethers.constants.WeiPerEther.mul(2);

        await nfnovelContract
          .connect(bidder)
          .placeBid(1, { value: bidAmountWei });

        expect(await nfnovelContract.connect(bidder).checkBid(1)).to.eq(
          bidAmountWei
        );
      });
    });
  });
});

import { expect } from "chai";
import { ethers, BigNumber, ContractTransaction } from "ethers";
import {
  getTestSigningAccounts,
  deployNFNovelTestContract,
  setBlockToAuctionEndTime,
} from "./utils";

import type { Signer } from "ethers";
import type { NFNovel } from "../typechain";

describe("NFNovel [Auctionable]: Panel Auctions", () => {
  let owner: Signer;
  let firstBidder: Signer;
  let firstBidderAddress: string;
  let secondBidder: Signer;

  before(async () => {
    [[owner], [firstBidder, firstBidderAddress], [secondBidder]] =
      await getTestSigningAccounts();
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
        minimumBidIncrement: 0,
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

      it(
        "with BidBelowMinimumIncrement if the cumulative bid of the caller is below the highest bid + the minimum bid increment"
      );

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

      it(
        "with BidBelowHighestBid if the cumulative bid is below the highest bid"
      );

      context("successful call", () => {
        it("adds the transaction value to the current bid of the caller");

        it("sets the caller as the auction highest bidder");

        it("emits a BidRaised() event");
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
          nfnovelContract.connect(firstBidder).withdrawBid(1)
        ).to.be.revertedWith("NoBidToWithdraw");
      });

      it("with CannotWithdrawHighestBid if the caller is the highest bidder", async () => {
        const nfnovelContract = await deployNFNovelTestContract(
          owner,
          "title",
          "SYM"
        );

        await nfnovelContract.addPage(1, "");

        await nfnovelContract.connect(firstBidder).placeBid(1, {
          value: ethers.constants.WeiPerEther.mul(3),
        });

        // confirm they are the highest bidder
        expect(
          (await nfnovelContract.auctions(1)).highestBidder
        ).to.be.hexEqual(firstBidderAddress);

        return expect(
          nfnovelContract.connect(firstBidder).withdrawBid(1)
        ).to.be.revertedWith("CannotWithdrawHighestBid");
      });
    });

    context("successful call", () => {
      let nfnovelContract: NFNovel;
      let transaction: ContractTransaction;
      let highestBidderAccount: Signer;
      let nonHighestBidderAccount: Signer;
      let nonHighestBidderAddress: string;

      const panelAuctionId = BigNumber.from(1);
      const highestBidWei = ethers.constants.WeiPerEther.mul(3);
      const nonHighestBidWei = ethers.constants.WeiPerEther.mul(2);

      before(async () => {
        highestBidderAccount = secondBidder;
        nonHighestBidderAccount = firstBidder;
        nonHighestBidderAddress = firstBidderAddress;

        nfnovelContract = await deployNFNovelTestContract(
          owner,
          "title",
          "SYM"
        );

        await nfnovelContract.addPage(1, "");

        await nfnovelContract
          .connect(nonHighestBidderAccount)
          .placeBid(panelAuctionId, {
            value: nonHighestBidWei,
          });

        await nfnovelContract
          .connect(highestBidderAccount)
          .placeBid(panelAuctionId, {
            value: highestBidWei,
          });

        // confirm they are not the highest bidder
        expect(
          (await nfnovelContract.auctions(panelAuctionId)).highestBidder
        ).not.to.be.hexEqual(nonHighestBidderAddress);

        transaction = await nfnovelContract
          .connect(nonHighestBidderAccount)
          .withdrawBid(panelAuctionId);
      });

      it("transfers the total unused bid value of the bidder from the contract to the bidder (caller)", async () => {
        await expect(transaction).to.changeEtherBalances(
          [nfnovelContract, nonHighestBidderAccount],
          // contract loses (mul(-1)) value, non highest bidder gains value
          [nonHighestBidWei.mul(-1), nonHighestBidWei]
        );
      });

      it("emits a BidWithdrawn(panelAuctionId, bidder, withdrawValue) event", () =>
        expect(transaction)
          .to.emit(
            nfnovelContract,
            nfnovelContract.interface.events[
              "BidWithdrawn(uint256,address,uint256)"
            ].name
          )
          .withArgs(panelAuctionId, nonHighestBidderAddress, nonHighestBidWei));
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
          .connect(firstBidder)
          .placeBid(1, { value: bidAmountWei });

        expect(await nfnovelContract.connect(firstBidder).checkBid(1)).to.eq(
          bidAmountWei
        );
      });
    });
  });
});

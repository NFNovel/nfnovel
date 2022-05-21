import {
  addBlockTime,
  computeInterfaceId,
  getTestSigningAccounts,
  deployNFNovelTestContract,
  setPanelAuctionWinner,
  mintSinglePagePanel,
  mintMultiplePagePanels,
  setBlockToAuctionEndTime,
} from "./utils";
import { expect } from "chai";
import { OZ_INTERFACE_IDS } from "./constants";
// eslint-disable-next-line camelcase
import { Ownable__factory } from "../typechain/factories/Ownable__factory";
// eslint-disable-next-line camelcase
import { Auctionable__factory } from "../typechain/factories/Auctionable__factory";
import { BigNumber } from "ethers";
import { ethers } from "hardhat";

import type { ContractTransaction, Signer } from "ethers";
import type { NFNovel } from "../typechain/NFNovel";

describe("NFNovel", () => {
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

  describe("interface implementation", () => {
    let nfnovelContract: NFNovel;
    before(async () => {
      nfnovelContract = await deployNFNovelTestContract(
        owner,
        "Novel",
        "NFN-1"
      );
    });

    it("is ERC-721", async () =>
      expect(await nfnovelContract.supportsInterface(OZ_INTERFACE_IDS.ERC721))
        .to.be.true);

    it("is Ownable", async () => {
      const ownableInterface = Ownable__factory.createInterface();
      const ownableInterfaceId = computeInterfaceId(ownableInterface);

      expect(await nfnovelContract.supportsInterface(ownableInterfaceId)).to.be
        .true;
    });

    it("is Auctionable", async () => {
      const auctionableInterface = Auctionable__factory.createInterface();

      // Auctionable is Ownable, must compute with both
      const auctionableInterfaceId = computeInterfaceId(auctionableInterface);

      expect(await nfnovelContract.supportsInterface(auctionableInterfaceId)).to
        .be.true;
    });
  });

  describe("addPage", () => {
    context("reverts", () => {
      let nfnovelContract: NFNovel;
      before(async () => {
        nfnovelContract = await deployNFNovelTestContract(
          owner,
          "Mysterio",
          "NFN-1"
        );
      });

      it("if called by a non-owner", () =>
        expect(nfnovelContract.connect(nonOwner).addPage(1, "")).to.be
          .reverted);

      it("with InvalidPanelsCount if called with 0 panels", () =>
        expect(nfnovelContract.addPage(0, "")).to.be.revertedWith(
          "InvalidPanelsCount"
        ));
    });

    context("successful call", () => {
      let nfnovelContract: NFNovel;

      const panelsCount = 2;
      const obscuredBaseURI = "ipfs://obscured";

      before(async () => {
        nfnovelContract = await deployNFNovelTestContract(
          owner,
          "Mysterio",
          "NFN-1"
        );
      });

      it("emits a PageAdded(pageNumber, panelTokenIds) event", async () => {
        // pageNumber = 1 (first page)
        const expectedPageNumber = BigNumber.from(1);
        // panel token IDs = [1, 2] (first 2 panels)
        const expectedpanelTokenIds = [BigNumber.from(1), BigNumber.from(2)];

        return (
          expect(nfnovelContract.addPage(panelsCount, obscuredBaseURI))
            .to.emit(
              nfnovelContract,
              nfnovelContract.interface.events["PageAdded(uint256,uint256[])"]
                .name
            )
            // PageAdded(pageNumber, panelTokenIds)
            .withArgs(expectedPageNumber, expectedpanelTokenIds)
        );
      });

      // NOTE: coupled to previous test (expects pageNumber 1 to exist)
      it("sets the Page isRevealed field to false", async () => {
        const page = await nfnovelContract.getPage(1);
        expect(page.isRevealed).to.be.false;
      });

      context("page panels", () => {
        let nfnovelContract: NFNovel;
        let page: {
          isRevealed: boolean;
          pageNumber: BigNumber;
          baseURI: string;
          panelTokenIds: BigNumber[];
        };

        const panelsCount = 3;

        before(async () => {
          nfnovelContract = await deployNFNovelTestContract(
            owner,
            "Mysterio",
            "NFN-1"
          );

          await nfnovelContract.addPage(panelsCount, obscuredBaseURI);
          page = await nfnovelContract.getPage(1);
        });

        it("assigns sequential token IDs to each panel of the page", () => {
          expect(page.panelTokenIds).to.have.lengthOf(panelsCount);

          for (const [panelIndex, panelTokenId] of Object.entries(
            page.panelTokenIds
          )) {
            expect(panelTokenId).to.eq(BigNumber.from(panelIndex).add(1));
          }
        });

        it("does not mint (assign to an owner) any panels of the page", async () => {
          for (const panelTokenId of page.panelTokenIds) {
            // ownerOf requires owner != address(0)
            await expect(nfnovelContract.ownerOf(panelTokenId)).to.be.reverted;
          }
        });

        it("associates each panel to the page number (panelPageNumbers view)", async () => {
          for (const panelTokenId of page.panelTokenIds) {
            expect(
              await nfnovelContract.getPanelPageNumber(panelTokenId)
            ).to.eq(BigNumber.from(1));
          }
        });

        it("creates an auction for each panel (panelAuctionIds view)", async () => {
          for (const panelTokenId of page.panelTokenIds) {
            const panelAuctionId = await nfnovelContract.getPanelAuctionId(
              panelTokenId
            );
            const panelAuction = await nfnovelContract.auctions(panelAuctionId);

            expect(panelAuction.tokenId).to.eq(panelTokenId);
          }
        });
      });
    });
  });

  describe("mintPanel", () => {
    context("reverts", () => {
      let nfnovelContract: NFNovel;
      before(async () => {
        nfnovelContract = await deployNFNovelTestContract(
          owner,
          "Mysterio",
          "NFN-1"
        );
      });

      it("with InvalidPanelTokenId if a non-existent panel token ID is used", async () =>
        await expect(nfnovelContract.mintPanel(1)).to.be.revertedWith(
          "InvalidPanelTokenId"
        ));

      it("with PanelAuctionNotEnded(panelAuctionId) if the auction has not ended", async () => {
        await nfnovelContract.addPage(1, "firstPage");
        await expect(nfnovelContract.mintPanel(1)).to.be.revertedWith(
          "PanelAuctionNotEnded(1)"
        );
      });

      it("with NotPanelAuctionWinner(panelAuctionId) if the caller is not the winner of the auction", async () => {
        const auctionDurationSeconds = 100;
        const nfnovelContract = await deployNFNovelTestContract(
          owner,
          "Mysterio",
          "NFN-1"
        );

        await nfnovelContract.setAuctionDefaults({
          duration: auctionDurationSeconds,
          minimumBidValue: 0,
          startingValue: 0,
        });

        await nfnovelContract.addPage(1, "firstPage");

        await nfnovelContract.connect(bidder).placeBid(1, {
          value: ethers.constants.WeiPerEther.mul(1),
        });

        await addBlockTime(auctionDurationSeconds);

        console.log({ auction: await nfnovelContract.auctions(1) });

        // sanity check
        expect(bidderAddress).not.to.hexEqual(nonOwnerAddress);

        await nfnovelContract.endPanelAuction(1);

        await expect(
          nfnovelContract.connect(nonOwner).mintPanel(1)
        ).to.be.revertedWith("NotPanelAuctionWinner(1)");
      });
    });

    context("successful call", () => {
      let nfnovelContract: NFNovel;
      before(async () => {
        nfnovelContract = await deployNFNovelTestContract(
          owner,
          "Mysterio",
          "NFN-1"
        );
      });
      it("mints the panel associating it with the auction winner (caller) address", async () => {
        await nfnovelContract.addPage(1, "secondPage");

        await setPanelAuctionWinner(nfnovelContract, {
          winner: bidder,
          panelTokenId: 1,
        });

        await nfnovelContract.connect(bidder).mintPanel(1);

        expect(await nfnovelContract.ownerOf(1)).to.hexEqual(bidderAddress);
      });
    });
  });

  describe("revealPage", () => {
    context("reverts", () => {
      let nfnovelContract: NFNovel;

      const pageNumber = 1;
      const panelsCount = 1;
      const panelTokenId = 1;
      const obscuredBaseURI = "ipfs://obscured";
      const revealedBaseURI = "ipfs://revealed";

      before(async () => {
        nfnovelContract = await deployNFNovelTestContract(
          owner,
          "Mysterio",
          "NFN-1"
        );

        await nfnovelContract.addPage(panelsCount, obscuredBaseURI);
      });

      it("with PageNotFound if the page is not found", () =>
        expect(
          nfnovelContract.revealPage(pageNumber + 1, revealedBaseURI)
        ).to.be.revertedWith("PageNotFound"));

      it("if called by a non-owner", () =>
        expect(
          nfnovelContract
            .connect(nonOwner)
            .revealPage(pageNumber, revealedBaseURI)
        ).to.be.reverted);

      it("with PanelNotSold(panelTokenId) if a panel of the page has not been sold", () =>
        expect(
          nfnovelContract.revealPage(pageNumber, revealedBaseURI)
        ).to.be.revertedWith(`PanelNotSold(${panelTokenId})`));

      it("with PageAlreadyRevealed if the page has already been revealed to ensure the base URI can only be changed once", async () => {
        await mintSinglePagePanel(nfnovelContract, bidder, panelTokenId);

        // reveal page to set isRevealed = true
        await nfnovelContract.revealPage(pageNumber, revealedBaseURI);

        // attempt to reveal the same page again and expect to be reverted
        return expect(
          nfnovelContract.revealPage(pageNumber, revealedBaseURI)
        ).to.be.revertedWith("PageAlreadyRevealed");
      });
    });

    context("successful call", () => {
      let nfnovelContract: NFNovel;
      let transaction: ContractTransaction;
      // minimal Page struct type for test
      let page: {
        isRevealed: boolean;
        baseURI: string;
        panelTokenIds: BigNumber[];
      };

      const pageNumber = 1;
      const panelsCount = 2;
      const panelTokenIds = [1, 2];
      const obscuredBaseURI = "ipfs://obscured";
      const revealedBaseURI = "ipfs://revealed";

      before(async () => {
        nfnovelContract = await deployNFNovelTestContract(
          owner,
          "Mysterio",
          "NFN-1"
        );

        // setup: add page -> mint the panel so revealedPage can be called -> reveal page for tests
        await nfnovelContract.addPage(panelsCount, obscuredBaseURI);

        await mintMultiplePagePanels(nfnovelContract, bidder, panelTokenIds);

        // capture the transaction to test for emitted events
        transaction = await nfnovelContract.revealPage(
          pageNumber,
          revealedBaseURI
        );

        page = await nfnovelContract.getPage(pageNumber);
      });

      it("sets the page isRevealed flag to true", () =>
        expect(page.isRevealed).to.be.true);

      it("sets the page baseURI to the revealed base URI", () =>
        expect(page.baseURI).to.equal(revealedBaseURI));

      it("emits an OpenSea PermanentURI(revealedTokenURI, panelTokenId) event for each panel token", async () => {
        for (const panelTokenId of panelTokenIds) {
          const expectedTokenURI = `${revealedBaseURI}/${panelTokenId}`;

          await expect(transaction)
            .to.emit(
              nfnovelContract,
              nfnovelContract.interface.events["PermanentURI(string,uint256)"]
                .name
            )
            .withArgs(expectedTokenURI, panelTokenId);
        }
      });

      it("emits a PageRevealed(pageNumber, panelTokenIds) event", () =>
        expect(transaction)
          .to.emit(
            nfnovelContract,
            nfnovelContract.interface.events["PageRevealed(uint256,uint256[])"]
              .name
          )
          .withArgs(pageNumber, page.panelTokenIds));
    });
  });

  describe("view functions", () => {
    let nfnovelContract: NFNovel;

    const pageNumber = 1;
    const panelsCount = 2;
    const panelTokenIds = [1, 2];
    const obscuredBaseURI = "ipfs://obscured";

    before(async () => {
      nfnovelContract = await deployNFNovelTestContract(
        owner,
        "Mysterio",
        "NFN-1"
      );

      await nfnovelContract.addPage(panelsCount, obscuredBaseURI);
    });

    it("getPage(pageNumber): returns the Page", async () => {
      const page = await nfnovelContract.getPage(pageNumber);
      expect(page.pageNumber).to.eq(pageNumber);
      expect(page.isRevealed).to.be.false;
      expect(page.baseURI).to.eq(obscuredBaseURI);
      expect(page.panelTokenIds).to.deep.eq(panelTokenIds.map(BigNumber.from));
    });

    it("getPanelPageNumber(panelTokenId): returns the page number of the panel", async () => {
      for (const panelTokenId of panelTokenIds) {
        expect(await nfnovelContract.getPanelPageNumber(panelTokenId)).to.eq(
          pageNumber
        );
      }
    });

    it("getPanelAuctionId(panelTokenId): returns the auction ID", async () => {
      for (const panelTokenId of panelTokenIds) {
        // panelTokenId and panelAuctionId are sequential, should be equal
        expect(await nfnovelContract.getPanelAuctionId(panelTokenId)).to.eq(
          panelTokenId
        );
      }
    });

    it("tokenURI(panelTokenId): returns {Page.baseURI}/{panelTokenId}", async () => {
      for (const panelTokenId of panelTokenIds) {
        const expectedTokenURI = `${obscuredBaseURI}/${panelTokenId}`;
        expect(await nfnovelContract.tokenURI(panelTokenId)).to.eq(
          expectedTokenURI
        );
      }
    });

    context("isPageSold", () => {
      it("returns false if any panel of the page has not been sold", async () =>
        expect(await nfnovelContract.isPageSold(pageNumber)).to.be.false);

      it("returns true if all panels of the page have been sold", async () => {
        await mintMultiplePagePanels(nfnovelContract, bidder, panelTokenIds);
        expect(await nfnovelContract.isPageSold(pageNumber)).to.be.true;
      });
    });
  });

  describe.only("Panel Auctions", () => {
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
});

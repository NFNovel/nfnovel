import {
  addBlockTime,
  computeInterfaceId,
  getTestSigningAccounts,
  deployNFNovelTestContract,
  setPanelAuctionWinner,
  mintSinglePagePanel,
  mintMultiplePagePanels,
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
          minimumBidIncrement: 0,
          startingValue: 0,
        });

        await nfnovelContract.addPage(1, "firstPage");

        await nfnovelContract.connect(bidder).addToBid(1, {
          value: ethers.constants.WeiPerEther.mul(1),
        });

        await addBlockTime(auctionDurationSeconds);

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
});

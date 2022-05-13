import {
  computeInterfaceId,
  getTestSigningAccounts,
  deployNFNovelTestContract,
} from "./utils";
import type { Signer } from "ethers";
import type { NFNovel } from "../typechain/NFNovel";
import { expect } from "chai";
import { OZ_INTERFACE_IDS } from "./constants";
// eslint-disable-next-line camelcase
import { Ownable__factory } from "../typechain/factories/Ownable__factory";
// eslint-disable-next-line camelcase
import { Auctionable__factory } from "../typechain/factories/Auctionable__factory";
import { BigNumber } from "ethers";

describe("NFNovel", () => {
  let owner: Signer;
  let ownerAddress: string;
  let nonOwner: Signer;
  let nonOwnerAddress: string;

  before(async () => {
    [[owner, ownerAddress], [nonOwner, nonOwnerAddress]] =
      await getTestSigningAccounts();
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

      it("if called with 0 panels", () =>
        expect(nfnovelContract.addPage(0, "")).to.be.reverted);
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
      it(
        "with PageNotFound(pageNumber) if a non-existent panel token ID is used"
      );

      it(
        "with PanelAuctionNotEnded(panelAuctionId) if the auction has not ended"
      );

      it(
        "with NotPanelAuctionWinner(panelAuctionId) if the caller is not the winner of the auction"
      );
    });

    context("successful call", () => {
      it(
        "mints the panel associating it with the auction winner (caller) address"
      );
    });
  });

  describe("revealPage", () => {
    context("reverts", () => {
      let nfnovelContract: NFNovel;
      before(async () => {
        nfnovelContract = await deployNFNovelTestContract(
          owner,
          "Mysterio",
          "NFN-1"
        );
      });

      it("with PageNotFound if the page is not found");
      it("with PageAlreadyRevealed if the page has already been revealed");
      it(
        "with PanelNotSold(panelTokenId) if a panel of the page has not been sold"
      );
    });

    context("successful call", () => {
      it("sets the page isRevealed flag to true");
      it("sets the page baseURI to the revealed base URI");
      it("emits a PageRevealed(pageNumber, panelTokenIds) event");
      it(
        "emits an OpenSea PermanentURI(revealedTokenURI, panelTokenId) event for each panel token"
      );
    });
  });

  describe("view functions", () => {
    it("pages(pageNumber): returns the Page");

    it("panelPages(panelTokenId): returns the page number of the panel");

    it("panelAuctions(panelTokenId): returns the auction ID");

    it("tokenURI(panelTokenId): returns {Page.baseURI}/{panelTokenId}");

    context("isPageSold", () => {
      it("returns true if all panels of the page have been sold");
      it("returns false if any panel of the page has not been sold");
    });
  });

  describe("Panel auctions", () => {
    // TODO: auction functions (bidding)
    // THINK: separate to Auctionable test suite (how to put it on a dummy contract to isolate its behavior?)

    context("view functions", () => {
      it("auctions(panelAuctionId): returns the Auction of the panel token");
      it("auctionDefaults: returns the default Auction settings");
      it(
        "auctionTimeRemaining(panelAuctionId): returns the unix seconds remaining in the panel auction"
      );
    });
  });
});

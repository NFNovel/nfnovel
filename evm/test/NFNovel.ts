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

      it("if called by a non-owner");
      it("if called with 0 panels");
    });

    context("successful call", () => {
      it("returns the page number of the new page");
      it("assigns a sequential page number to the page");
      it("assigns token IDs to each panel of the page");
      it("does not mint (assign to an owner) any panels of the page");
      it("associates each panel to the page");
      it("creates an auction for each panel");
      it("emits a PageAdded(pageNumber, panelTokenIds) event");
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
      it("does not emit PermanentURI for any panel if the call is reverted");
    });

    context("successful call", () => {
      it("sets the page isRevealed flag to true");
      it("sets the page baseURI to the revealed base URI");
      it("emits a PageRevealed(pageNumber, panelTokenIds) event");
      it(
        "emits a PermanentURI(revealedTokenURI, panelTokenId) event for each panel token"
      );
    });
  });

  describe("isPageSold", () => {
    it("returns true if all panels of the page have been sold");
    it("returns false if any panel of the page has not been sold");
  });

  describe("view functions", () => {
    it("pages(pageNumber): returns the Page");

    it("panelPages(panelTokenId): returns the page number of the panel");

    it("panelAuctions(panelTokenId): returns the auction ID");

    it("tokenURI(panelTokenId): returns {Page.baseURI}/{panelTokenId}");

    context("Auctionable", () => {
      it("auctions(panelAuctionId): returns the Auction of the panel token");
      it("auctionDefaults: returns the default Auction settings");
      it(
        "auctionTimeRemaining(panelAuctionId): returns the unix seconds remaining in the panel auction"
      );
    });
  });
});

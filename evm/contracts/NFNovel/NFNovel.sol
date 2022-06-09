// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "hardhat/console.sol";

import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "../Auction/structures.sol";
import "../Auction/Auctionable.sol";

import "./interface.sol";
import "./structures.sol";

// THINK: add a "subscribers" list (only cost of storing address) for people to be eligible for giveaways, track interest, and identify for privileges on discord
contract NFNovel is ERC721, INFNovel, Ownable, Auctionable {
    using Strings for uint256;
    using Counters for Counters.Counter;

    Counters.Counter private _pageNumbers;
    Counters.Counter private _panelTokenIds;

    // TODO: test
    // THINK: alternate is when a panel is minted store payouts (withdrawableAuctionedValue) in mapping (owner/creatorAddress -> payout) according to proportion of ownership and then call withdrawAuctionedValueTo(payee, payout)
    // THINK: this would allow panel owners to get a royalty proportional to the number of panels they own (say 10% of numberOwned/totalPanels, 10% NFNovel, 80% creators) BUT will require keeping track (minting and transfer) how many panels each owner holds
    function withdraw(uint256 withdrawAmount) public onlyOwner returns (bool) {
        // NOTE: can use withdrawAuctionedValueTo(to, withdrawAmount) when implementing creator payouts
        // add onlyOwnerOrCreator modifier
        // THINK: will need to keep track of amounts each have withdrawn to maintain royalty payouts
        // THINK: alternatively make it onlyOwner and enforce all payouts at once (owner, creator, ...creatorN)
        return withdrawAuctionedValue(withdrawAmount);
    }

    // mapping(pageNumber => Page)
    mapping(uint256 => Page) private pages;
    // mapping(panelTokenId => pageNumber)
    mapping(uint256 => uint256) private panelPageNumbers;
    // mapping(panelTokenId => panelAuctionId)
    mapping(uint256 => uint256) private panelAuctionIds;

    constructor(string memory novelTitle, string memory novelSymbol)
        ERC721(novelTitle, novelSymbol)
    {}

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721)
        returns (bool)
    {
        return
            interfaceId == type(Ownable).interfaceId ||
            interfaceId == type(Auctionable).interfaceId ||
            super.supportsInterface(interfaceId);
    }

    function getPage(uint256 pageNumber)
        public
        view
        override
        returns (Page memory page)
    {
        page = pages[pageNumber];
        if (page.pageNumber == 0) revert PageNotFound();
    }

    function getPanelPageNumber(uint256 panelTokenId)
        public
        view
        override
        returns (uint256 pageNumber)
    {
        pageNumber = panelPageNumbers[panelTokenId];
        if (pageNumber == 0) revert InvalidPanelTokenId();
    }

    function getPanelAuctionId(uint256 panelTokenId)
        public
        view
        override
        returns (uint256 panelAuctionId)
    {
        panelAuctionId = panelAuctionIds[panelTokenId];
        if (panelAuctionId == 0) revert InvalidPanelTokenId();
    }

    function isPageSold(uint256 pageNumber)
        public
        view
        override
        returns (bool)
    {
        uint256[] memory panelTokenIds = getPage(pageNumber).panelTokenIds;

        for (
            uint256 panelIndex = 0;
            panelIndex < panelTokenIds.length;
            panelIndex++
        ) {
            if (!_exists(panelTokenIds[panelIndex])) return false;
        }

        return true;
    }

    function tokenURI(uint256 panelTokenId)
        public
        view
        override
        returns (string memory)
    {
        Page storage page = _getPanelPage(panelTokenId);

        return _buildTokenURI(page.baseURI, panelTokenId);
    }

    function mintPanel(uint256 panelTokenId) public override returns (bool) {
        Auction storage panelAuction = _getAuction(
            getPanelAuctionId(panelTokenId)
        );

        if (panelAuction.highestBidder != msg.sender)
            revert NotPanelAuctionWinner(panelAuction.id);

        bool success = _endAuction(panelAuction);
        require(success);

        _safeMint(msg.sender, panelTokenId);

        return true;
    }

    function addPage(uint8 panelsCount, string calldata obscuredBaseURI)
        public
        override
        onlyOwner
        returns (uint256 pageNumber)
    {
        if (panelsCount == 0) revert InvalidPanelsCount();

        pageNumber = _generatePageNumber();

        pages[pageNumber] = Page(
            false,
            obscuredBaseURI,
            pageNumber,
            new uint256[](panelsCount)
        );

        for (uint256 panelIndex = 0; panelIndex < panelsCount; panelIndex++) {
            uint256 panelTokenId = _generatePanelTokenId();

            panelPageNumbers[panelTokenId] = pageNumber;
            pages[pageNumber].panelTokenIds[panelIndex] = panelTokenId;
            // THINK: what happens if an auction ends without a winner? way to restart or set buy-it-now price?
            panelAuctionIds[panelTokenId] = _startAuction(panelTokenId);
        }

        emit PageAdded(pageNumber, pages[pageNumber].panelTokenIds);
    }

    // THINK: implement the hashedRevealedBaseURI idea that Karol suggested
    // this is a way to ensure the revealedBaseURI is consistent
    function revealPage(uint256 pageNumber, string calldata revealedBaseURI)
        public
        override
        onlyOwner
    {
        Page storage page = _getPage(pageNumber);

        // prevents the panel token URI ever being changed after being revealed
        if (page.isRevealed == true) revert PageAlreadyRevealed();

        for (
            uint256 panelIndex = 0;
            panelIndex < page.panelTokenIds.length;
            panelIndex++
        ) {
            uint256 panelTokenId = page.panelTokenIds[panelIndex];

            // ensures all panels have been sold before completing loop and marking page as revealed + setting revealed base URI
            if (!_exists(panelTokenId)) revert PanelNotSold(panelTokenId);

            // NOTE: these events will only emit if the whole call succeeds
            // if it gets reverted at any point none will be emitted, so safe to call in same loop
            emit PermanentURI(
                _buildTokenURI(revealedBaseURI, panelTokenId),
                panelTokenId
            );
        }

        page.isRevealed = true;
        page.baseURI = revealedBaseURI;

        emit PageRevealed(pageNumber, page.panelTokenIds);
    }

    function _generatePanelTokenId() private returns (uint256 panelTokenId) {
        _panelTokenIds.increment();
        panelTokenId = _panelTokenIds.current();
    }

    function _generatePageNumber() private returns (uint256 pageNumber) {
        _pageNumbers.increment();
        pageNumber = _pageNumbers.current();
    }

    function _buildTokenURI(string memory pageBaseURI, uint256 panelTokenId)
        private
        pure
        returns (string memory)
    {
        return
            string(abi.encodePacked(pageBaseURI, "/", panelTokenId.toString()));
    }

    function _getPage(uint256 pageNumber) private view returns (Page storage) {
        Page storage page = pages[pageNumber];
        if (page.pageNumber == 0) revert PageNotFound();

        return page;
    }

    function _getPanelPage(uint256 panelTokenId)
        private
        view
        returns (Page storage)
    {
        return _getPage(getPanelPageNumber(panelTokenId));
    }
}

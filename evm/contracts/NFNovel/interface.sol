// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./structures.sol";

interface OpenSeaCompatible {
    // OpenSea: https://docs.opensea.io/docs/metadata-standards#freezing-metadata
    event PermanentURI(string tokenURI, uint256 tokenId);
}

interface INFNovel is OpenSeaCompatible {
    error PageNotFound();
    error InvalidPanelsCount();
    error InvalidPanelTokenId();
    error PageAlreadyRevealed();
    error PanelNotSold(uint256 panelTokenId);
    error PanelAuctionNotEnded(uint256 panelAuctionId);
    error NotPanelAuctionWinner(uint256 panelAuctionId);

    // FUTURE:
    // event CreatorAdded(Creator creator);
    // event CreatorModified(Creator creator);

    // NOTE: do not index the panelTokenIds as they will not be readable, only a hash of the array will be logged
    // https://docs.soliditylang.org/en/v0.8.15/contracts.html#events
    // > A topic can only hold a single word (32 bytes) so if you use a reference type for an indexed argument, the Keccak-256 hash of the value is stored as a topic instead.
    event PageAdded(uint256 indexed pageNumber, uint256[] panelTokenIds);

    event PageRevealed(uint256 indexed pageNumber, uint256[] panelTokenIds);

    function getCurrentPageNumber()
        external
        view
        returns (uint256 currentPageNumber);

    function getPage(uint256 pageNumber)
        external
        view
        returns (Page memory page);

    function getPanelPageNumber(uint256 panelTokenId)
        external
        view
        returns (uint256 pageNumber);

    function getPanelAuctionId(uint256 panelTokenId)
        external
        view
        returns (uint256 panelAuctionId);

    function isPageSold(uint256 pageNumber) external view returns (bool);

    function addPage(uint8 panelsCount, string calldata obscuredBaseURI)
        external
        returns (uint256 pageNumber);

    function mintPanel(uint256 panelTokenId) external returns (bool);

    function revealPage(uint256 pageNumber, string calldata revealedBaseURI)
        external;
}

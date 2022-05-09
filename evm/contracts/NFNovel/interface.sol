// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "./structures.sol";

interface INFNovel {
    error PageNotFound();
    error PanelNotSold(uint256 panelTokenId);
    error PanelAuctionNotEnded(uint256 panelAuctionId);
    error NotPanelAuctionWinner(uint256 panelAuctionId);

    // OpenSea: https://docs.opensea.io/docs/metadata-standards#freezing-metadata
    event PermanentURI(string tokenURI, uint256 tokenId);

    event PageAdded(uint256 pageNumber, uint256[] panelTokenIds);
    event PageSold(uint256 pageNumber, uint256[] panelTokenIds);
    event PageRevealed(uint256 pageNumber, uint256[] panelTokenIds);

    function addPage(uint8 panelsCount, string calldata obscuredBaseURI)
        external
        returns (uint256 pageNumber);

    function revealPage(uint256 pageNumber, string calldata revealedBaseURI)
        external;

    function isPageSold(uint256 pageNumber) external view returns (bool);

    function mintPanel(uint256 panelTokenId) external returns (bool);
}

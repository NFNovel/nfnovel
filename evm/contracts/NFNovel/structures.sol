// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

struct Page {
    bool isRevealed;
    string baseURI;
    uint256 pageNumber;
    uint256[] panelTokenIds;
}

enum ArtistTypes {
    Writer,
    Artist
}

struct Creator {
    address payable withdrawAddress;
    ArtistTypes artistType;
    uint8 royaltyPercent;
}

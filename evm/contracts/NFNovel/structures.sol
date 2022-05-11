// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

struct Page {
    bool isRevealed;
    string baseURI;
    uint256 pageNumber;
    uint256[] panelTokenIds;
}

// FUTURE:
// enum ArtistTypes {
//     Writer,
//     Illustator
// }

// FUTURE:
// struct Creator {
//     address payable withdrawAddress;
//     ArtistTypes artistType;
//     uint8 royaltyPercent;
// }

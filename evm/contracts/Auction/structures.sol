// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

enum AuctionStates {
    Pending,
    Active,
    Ended,
    Cancelled
}

struct Auction {
    AuctionStates state;
    uint256 id;
    uint256 tokenId;
    uint256 startTime;
    uint256 endTime;
    uint256 startingValue;
    uint256 minimumBidValue;
    uint256 highestBid;
    address highestBidder;
    mapping(address => uint256) bids;
}

struct AuctionDefaults {
    uint256 duration;
    uint256 startingValue;
    uint256 minimumBidValue;
}

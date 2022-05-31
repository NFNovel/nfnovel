// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./structures.sol";
import "./AuctionManagement.sol";

abstract contract Auctionable {
    using Counters for Counters.Counter;
    using AuctionManagement for Auction;

    // NOTE: event params must be indexed to be used in event filters
    event AuctionStarted(
        uint256 indexed auctionId,
        uint256 indexed tokenId,
        uint256 indexed endTime,
        uint256 startingValue
    );

    event AuctionEnded(
        uint256 indexed auctionId,
        address winner,
        uint256 finalValue
    );

    event AuctionCancelled(uint256 indexed auctionId);

    event AuctionBidRaised(
        uint256 indexed auctionId,
        address indexed highestBidder,
        uint256 indexed highestBid
    );

    event AuctionBidWithdrawn(
        uint256 indexed auctionId,
        address indexed withdrawnBidder,
        uint256 indexed withdrawnBid
    );

    event AuctionDefaultsUpdated(AuctionSettings newDefaults);

    error AuctionNotFound();

    Counters.Counter private _auctionIds;

    mapping(uint256 => Auction) public auctions;

    AuctionSettings public auctionDefaults =
        AuctionSettings(
            1 days, // auction duration
            0 wei, // starting value (0 ETH)
            1000000000000000 wei // minimum bid (0.001 ETH)
        );

    function auctionTimeRemaining(uint256 auctionId)
        public
        view
        returns (uint256)
    {
        uint256 _endTime = _getAuction(auctionId).endTime;
        if (block.timestamp > _endTime) return 0;
        return _endTime - block.timestamp;
    }

    function addToBid(uint256 auctionId) public payable returns (bool success) {
        Auction storage auction = _getAuction(auctionId);

        success = auction.addToBid();

        emit AuctionBidRaised(
            auction.id,
            auction.highestBidder,
            auction.highestBid
        );
    }

    function checkBid(uint256 auctionId)
        public
        view
        returns (uint256 currentBid)
    {
        currentBid = _getAuction(auctionId).checkBid();
    }

    function withdrawBid(uint256 auctionId) public returns (bool success) {
        Auction storage auction = _getAuction(auctionId);
        (address bidder, uint256 withdrawValue) = auction.withdraw();
        emit AuctionBidWithdrawn(auction.id, bidder, withdrawValue);
        success = true;
    }

    function setAuctionDefaults(AuctionSettings calldata newDefaults) public {
        auctionDefaults = newDefaults;
        emit AuctionDefaultsUpdated(newDefaults);
    }

    function _startAuction(
        uint256 tokenId,
        AuctionSettings memory auctionSettings
    ) internal returns (uint256) {
        uint256 newAuctionId = _generateAuctionId();
        Auction storage newAuction = auctions[newAuctionId];

        newAuction.start(
            newAuctionId,
            tokenId,
            auctionSettings.duration,
            auctionSettings.startingValue,
            auctionSettings.minimumBidIncrement
        );

        emit AuctionStarted(
            newAuction.id,
            newAuction.tokenId,
            newAuction.startingValue,
            newAuction.endTime
        );

        return newAuctionId;
    }

    function _startAuction(uint256 tokenId) internal returns (uint256) {
        return _startAuction(tokenId, auctionDefaults);
    }

    function _endAuction(uint256 auctionId) internal returns (bool success) {
        Auction storage auction = _getAuction(auctionId);
        success = auction.end();
        emit AuctionEnded(
            auction.id,
            auction.highestBidder,
            auction.highestBid
        );
    }

    function _cancelAuction(uint256 auctionId) internal returns (bool success) {
        success = _getAuction(auctionId).cancel();
        emit AuctionCancelled(auctionId);
    }

    function _getAuction(uint256 auctionId)
        internal
        view
        returns (Auction storage)
    {
        Auction storage auction = auctions[auctionId];
        // NOTE: https://ethereum.stackexchange.com/a/13029
        // TLDR: a non-existent struct will have all "zeros" values for members
        // existent auction would never have ID 0
        if (auction.id == 0) revert AuctionNotFound();

        return auction;
    }

    function _generateAuctionId() private returns (uint256 newAuctionId) {
        _auctionIds.increment();
        newAuctionId = _auctionIds.current();
    }
}

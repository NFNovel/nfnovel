// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./structures.sol";
import "./AuctionManagement.sol";

abstract contract Auctionable {
    using Counters for Counters.Counter;
    using AuctionManagement for Auction;

    event AuctionStarted(
        uint256 auctionId,
        uint256 tokenId,
        uint256 startingValue,
        uint256 endTime
    );

    event AuctionEnded(
        uint256 auctionId,
        address winner,
        uint256 finalValue,
        string reason
    );

    event AuctionCancelled(uint256 auctionId);

    event AuctionBidRaised(
        uint256 auctionId,
        address highestBidder,
        uint256 highestBid
    );

    event AuctionBidWithdrawn(uint256 auctionId, address bidder, uint256 bid);

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
        emit AuctionBidRaised(
            auction.id,
            auction.highestBidder,
            auction.highestBid
        );
        success = auction.addToBid();
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
            auction.highestBid,
            auction.state == AuctionStates.Ended ? "time" : "cancelled"
        );
    }

    function _cancelAuction(uint256 auctionId) internal returns (bool) {
        return _getAuction(auctionId).cancel();
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

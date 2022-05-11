// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./structures.sol";
import "./AuctionManagement.sol";

abstract contract Auctionable is Ownable {
    using Counters for Counters.Counter;
    using AuctionManagement for Auction;

    error AuctionNotFound();
    event AuctionDefaultsUpdated(AuctionSettings newDefaults);

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
        return _getAuction(auctionId).endTime - block.timestamp;
    }

    function placeBid(uint256 auctionId) public payable returns (bool) {
        return _getAuction(auctionId).bid();
    }

    function withdrawBid(uint256 auctionId) public returns (bool) {
        return _getAuction(auctionId).withdraw();
    }

    function setAuctionDefaults(AuctionSettings calldata newDefaults)
        public
        onlyOwner
    {
        auctionDefaults = newDefaults;

        emit AuctionDefaultsUpdated(newDefaults);
    }

    function _startAuction(
        uint256 tokenId,
        AuctionSettings memory auctionSettings
    ) internal onlyOwner returns (uint256) {
        uint256 newAuctionId = _generateAuctionId();
        Auction storage newAuction = auctions[newAuctionId];

        newAuction.start(
            newAuctionId,
            tokenId,
            auctionSettings.duration,
            auctionSettings.startingValue,
            auctionSettings.minimumBidValue
        );

        return newAuctionId;
    }

    function _startAuction(uint256 tokenId)
        internal
        onlyOwner
        returns (uint256)
    {
        return _startAuction(tokenId, auctionDefaults);
    }

    function _endAuction(uint256 auctionId) internal onlyOwner returns (bool) {
        return _getAuction(auctionId).end();
    }

    function _cancelAuction(uint256 auctionId)
        internal
        onlyOwner
        returns (bool)
    {
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

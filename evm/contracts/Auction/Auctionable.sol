// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./AuctionManagement.sol";
import "./structures.sol";

abstract contract Auctionable is Ownable {
    using Counters for Counters.Counter;
    using AuctionManagement for Auction;

    Counters.Counter private _auctionIds;

    mapping(uint256 => Auction) public auctions;

    AuctionDefaults public auctionDefaults =
        AuctionDefaults(
            1 days, // auction duration
            0 wei, // starting value (0 ETH)
            1000000000000000 wei // minimum bid (0.001 ETH)
        );

    error AuctionNotFound();

    function auctionTimeRemaining(uint256 auctionId)
        public
        view
        returns (uint256)
    {
        return getAuction(auctionId).endTime - block.timestamp;
    }

    function placeBid(uint256 auctionId) public payable returns (bool) {
        // NOTE: confirm that this passes on the sender and value
        return getAuction(auctionId).bid();
    }

    function withdrawBid(uint256 auctionId) public returns (bool) {
        // NOTE: confirm that this passes on the sender and value
        return getAuction(auctionId).withdraw();
    }

    function setAuctionDefaults(
        uint256 duration,
        uint256 startingValue,
        uint256 minimumBidValue
    ) internal onlyOwner {
        auctionDefaults.duration = duration;
        auctionDefaults.startingValue = startingValue;
        auctionDefaults.minimumBidValue = minimumBidValue;
    }

    function startCustomAuction(
        uint256 tokenId,
        uint256 auctionDuration,
        uint256 startingValue,
        uint256 minimumBidValue
    ) internal onlyOwner returns (uint256) {
        uint256 newAuctionId = _generateAuctionId();
        Auction storage newAuction = auctions[newAuctionId];

        newAuction.start(
            newAuctionId,
            tokenId,
            auctionDuration,
            startingValue,
            minimumBidValue
        );

        return newAuctionId;
    }

    function startDefaultAuction(uint256 tokenId)
        internal
        onlyOwner
        returns (uint256)
    {
        return
            startCustomAuction(
                tokenId, // token for auction
                auctionDefaults.duration,
                auctionDefaults.startingValue,
                auctionDefaults.minimumBidValue
            );
    }

    function endAuction(uint256 auctionId) internal onlyOwner returns (bool) {
        // NOTE: confirm that this passes on the sender and value
        return getAuction(auctionId).end();
    }

    function cancelAuction(uint256 auctionId)
        internal
        onlyOwner
        returns (bool)
    {
        // NOTE: confirm that this passes on the sender and value
        return getAuction(auctionId).cancel();
    }

    function getAuction(uint256 auctionId)
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

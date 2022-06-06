// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./structures.sol";

library AuctionManagement {
    error AuctionNotPending();
    error AuctionIsActive();
    error AuctionNotActive();
    error CannotEndActiveAuction();

    error BiddersBeforeStart();
    error BidBelowHighestBid();
    error BidBelowStartingValue();
    error BidTooLow();

    error NoBidToWithdraw();
    error CannotWithdrawHighestBid();

    modifier onlyActiveAuction(Auction storage auction) {
        if (
            auction.state != AuctionStates.Active ||
            block.timestamp >= auction.endTime
        ) revert AuctionNotActive();

        _;
    }

    function start(
        Auction storage auction,
        uint256 auctionId,
        uint256 tokenId,
        uint256 auctionDuration,
        uint256 startingValue,
        uint256 minimumBidIncrement
    ) internal {
        if (auction.state != AuctionStates.Pending) revert AuctionNotPending();

        auction.id = auctionId;
        auction.tokenId = tokenId;

        auction.state = AuctionStates.Active;

        auction.startTime = block.timestamp;
        auction.endTime = block.timestamp + auctionDuration;

        auction.startingValue = startingValue;
        auction.minimumBidIncrement = minimumBidIncrement;

        auction.highestBid = startingValue;
        auction.highestBidder = address(0);
    }

    function addToBid(Auction storage auction)
        internal
        onlyActiveAuction(auction)
        returns (bool)
    {
        uint256 bidIncrement = msg.value;
        uint256 previousBid = auction.bids[msg.sender];
        uint256 bidAmount = previousBid + bidIncrement;

        _validateBid(auction, bidAmount);

        auction.highestBid = bidAmount;
        auction.highestBidder = msg.sender;

        auction.bids[msg.sender] += bidIncrement;

        return true;
    }

    // TODO: test
    function replaceBid(Auction storage auction)
        internal
        onlyActiveAuction(auction)
        returns (bool success, uint256 refundedValue)
    {
        address bidder = msg.sender;
        uint256 newBid = msg.value;
        uint256 previousBid = auction.bids[bidder];

        _validateBid(auction, newBid);
        _validateWithdrawal(auction, bidder, previousBid);

        auction.highestBid = newBid;
        auction.highestBidder = bidder;
        auction.bids[bidder] = newBid;

        (success, ) = bidder.call{value: previousBid}("");

        require(success);

        return (success, previousBid);
    }

    function checkBid(Auction storage auction)
        internal
        view
        returns (uint256 currentBid)
    {
        currentBid = auction.bids[msg.sender];
    }

    function cancel(Auction storage auction) internal returns (bool) {
        if (auction.state != AuctionStates.Active) revert AuctionNotActive();

        auction.state = AuctionStates.Cancelled;

        require(auction.state == AuctionStates.Cancelled);

        return true;
    }

    function end(Auction storage auction) internal returns (bool) {
        if (auction.state != AuctionStates.Active) revert AuctionNotActive();
        if (block.timestamp < auction.endTime) revert CannotEndActiveAuction();

        auction.state = AuctionStates.Ended;

        require(auction.state == AuctionStates.Ended);

        return true;
    }

    function withdrawBid(Auction storage auction)
        internal
        returns (bool success, uint256 withdrawValue)
    {
        address bidder = msg.sender;
        withdrawValue = auction.bids[bidder];

        _validateWithdrawal(auction, bidder, withdrawValue);

        auction.bids[bidder] = 0;

        (success, ) = bidder.call{value: withdrawValue}("");

        require(success);
    }

    function _validateBid(Auction storage auction, uint256 bidAmount)
        private
        view
    {
        if (bidAmount <= auction.highestBid) revert BidBelowHighestBid();
        if (bidAmount < auction.highestBid + auction.minimumBidIncrement)
            revert BidTooLow();
    }

    function _validateWithdrawal(
        Auction storage auction,
        address bidder,
        uint256 withdrawalValue
    ) private view {
        if (withdrawalValue == 0) revert NoBidToWithdraw();
        if (
            auction.highestBidder == bidder &&
            // TODO: test
            // only allow highest bidder to withdraw if auction has been cancelled
            auction.state != AuctionStates.Cancelled
        ) revert CannotWithdrawHighestBid();
    }
}

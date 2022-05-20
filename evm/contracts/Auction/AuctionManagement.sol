// //SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "./structures.sol";

library AuctionManagement {
    event AuctionStarted(
        uint256 auctionId,
        uint256 tokenId,
        uint256 startingValue,
        uint256 endTime
    );
    event AuctionEnded(address winner, uint256 finalValue, string reason);
    event AuctionCancelled();

    event BidRaised(address highestBidder, uint256 highestBid);
    event BidWithdrawn(address bidder, uint256 bid);

    error AuctionNotPending();
    error AuctionIsActive();
    error AuctionNotActive();

    error BiddersBeforeStart();
    error BidBelowHighestBid();
    error BidBelowStartingValue();
    error BidBelowMinimumIncrement();

    error NoBidToWithdraw();
    error CannotWithdrawHighestBid();

    function start(
        Auction storage auction,
        uint256 auctionId,
        uint256 tokenId,
        uint256 auctionDuration,
        uint256 startingValue,
        uint256 minimumBidValue
    ) internal {
        if (auction.state != AuctionStates.Pending) revert AuctionNotPending();

        auction.id = auctionId;
        auction.tokenId = tokenId;

        auction.state = AuctionStates.Active;

        auction.startTime = block.timestamp;
        auction.endTime = block.timestamp + auctionDuration;

        auction.startingValue = startingValue;
        auction.minimumBidValue = minimumBidValue;

        auction.highestBid = 0;
        auction.highestBidder = address(0);

        emit AuctionStarted(
            auction.id,
            auction.tokenId,
            auction.startingValue,
            auction.endTime
        );
    }

    function bid(Auction storage auction) internal returns (bool) {
        _confirmAuctionIsActive(auction);

        uint256 bidIncrement = msg.value;
        uint256 previousBid = auction.bids[msg.sender];
        uint256 bidAmount = previousBid + bidIncrement;

        _validateBid(auction, bidAmount);

        auction.highestBid = bidAmount;
        auction.highestBidder = msg.sender;

        auction.bids[msg.sender] += bidIncrement;

        emit BidRaised(auction.highestBidder, auction.highestBid);

        return true;
    }

    function cancel(Auction storage auction) internal returns (bool) {
        _endAuction(auction, AuctionStates.Cancelled);

        return auction.state == AuctionStates.Cancelled;
    }

    function end(Auction storage auction) internal returns (bool) {
        _endAuction(auction, AuctionStates.Ended);

        return auction.state == AuctionStates.Ended;
    }

    function withdraw(Auction storage auction) internal returns (bool) {
        // BUG: this cant be correct logic
        // also should we block withdrawals while the auction is active?
        // THINK: just dont let the highest bidder pull out?
        if (
            auction.state == AuctionStates.Ended ||
            auction.state == AuctionStates.Cancelled
        ) revert AuctionIsActive();

        address bidder = msg.sender;
        uint256 withdrawValue = auction.bids[bidder];

        _validateWithdrawal(auction, bidder, withdrawValue);

        auction.bids[bidder] = 0;

        payable(bidder).transfer(withdrawValue);

        emit BidWithdrawn(bidder, withdrawValue);

        return true;
    }

    function _endAuction(Auction storage auction, AuctionStates finalState)
        private
    {
        if (auction.state != AuctionStates.Active) revert AuctionNotActive();

        auction.state = finalState;

        emit AuctionEnded(
            auction.highestBidder,
            auction.highestBid,
            finalState == AuctionStates.Ended ? "time" : "cancelled"
        );
    }

    function _confirmAuctionIsActive(Auction storage auction) private {
        // check and end the auction (changing state to Ended) first
        if (block.timestamp >= auction.endTime) {
            _endAuction(auction, AuctionStates.Ended);
        }

        // then check if it is still active
        if (auction.state != AuctionStates.Active) revert AuctionNotActive();
    }

    function _validateBid(Auction storage auction, uint256 bidAmount)
        private
        view
    {
        if (bidAmount <= auction.startingValue) revert BidBelowStartingValue();
        if (bidAmount <= auction.highestBid) revert BidBelowHighestBid();
        if (bidAmount < auction.highestBid + auction.minimumBidValue)
            revert BidBelowMinimumIncrement();
    }

    function _validateWithdrawal(
        Auction storage auction,
        address bidder,
        uint256 withdrawalValue
    ) private view {
        if (withdrawalValue == 0) revert NoBidToWithdraw();
        if (auction.highestBidder == bidder) revert CannotWithdrawHighestBid();
    }
}

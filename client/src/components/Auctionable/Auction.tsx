import { ethers } from "ethers";
import {
  Box,
  Divider,
  Flex,
  Spinner,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";

import { convertToEth } from "./utils";
import RemainingTime from "./RemainingTime";
import useAuctionable from "./use-auctionable";
import BiddingForm, { WithdrawBidButton } from "./BiddingForm";

import type { Auction as AuctionType } from "src/types/auction";
import type { BigNumberish } from "ethers";
import type { IERC721TokenMetadata } from "src/types/token";
import type { IUseAuctionable, IUseAuctionableConfig } from "./use-auctionable";

export type AuctionableTokenDetails = {
  imageSource: string;
  tokenId: BigNumberish;
  metadata: IERC721TokenMetadata;
};

export type AuctionProps = IUseAuctionableConfig & {
  token: AuctionableTokenDetails;
  ClaimTokenButton: () => JSX.Element;
};

const HighestBid = (props: {
  highestBid: AuctionType["highestBid"];
  isActive: IUseAuctionable["isActive"];
  highestBidder: AuctionType["highestBidder"];
  connectedAccountAddress: AuctionProps["connectedAccountAddress"];
}) => {
  const {
    isActive,
    highestBid,
    highestBidder,
    connectedAccountAddress,
  } = props;

  let formattedHighestBidder;
  let highestBidLabel = isActive ? "Highest bid" : "Winning bid";

  if (highestBidder === ethers.constants.AddressZero) {
    highestBidLabel = "Starting bid";
    formattedHighestBidder = "No bids yet";
  } else if (highestBidder === connectedAccountAddress) {
    formattedHighestBidder = isActive ?
      "You are the highest bidder!" :
      "You won the auction!";
  } else {
    formattedHighestBidder = `${
      isActive ? "Winning" : "Highest"
    } bidder: ${highestBidder.slice(0, 6)}`;
  }

  const formattedHighestBid = convertToEth(highestBid, true);

  return (
    <Stat>
      <StatLabel>{highestBidLabel}</StatLabel>
      <StatNumber>{formattedHighestBid}</StatNumber>
      <StatHelpText>{formattedHighestBidder}</StatHelpText>
    </Stat>
  );
};

const Auction = (props: AuctionProps) => {
  const {
    auctionId,
    onAuctionEnded,
    ClaimTokenButton,
    auctionableReader,
    auctionableSigner,
    connectedAccountAddress,
  } = props;

  const {
    auction,
    isActive,
    currentBid,
    onAddToBid,
    onWithdrawBid,
    timeRemaining,
    transactionPending,
  } = useAuctionable({
    auctionId,
    onAuctionEnded,
    connectedAccountAddress,
    auctionableReader,
    auctionableSigner,
  });

  if (!auction) return <Spinner />;

  const isHighestBidder = auction.highestBidder === connectedAccountAddress;

  const canWithdraw = !isHighestBidder && currentBid.gt(0);

  return (
    <Flex
      h="100%"
      w="100%"
      direction={"column"}
      borderWidth={"1px"}
      borderRadius={5}
    >
      <Flex
        mt={2}
        wrap={"wrap"}
        justify="space-around"
        align={"space-around"}
      >
        <Box
          flexBasis={"auto"}
          textAlign="center"
        >
          <HighestBid
            isActive={isActive}
            highestBid={auction.highestBid}
            highestBidder={auction.highestBidder}
            connectedAccountAddress={connectedAccountAddress}
          />
        </Box>
        <Box flexBasis={"auto"}>
          <RemainingTime
            auction={auction}
            timeRemaining={timeRemaining}
          />
        </Box>
      </Flex>

      {(isActive || canWithdraw || isHighestBidder) && <Divider />}

      {isActive && (
        <BiddingForm
          auction={auction}
          isActive={isActive}
          currentBid={currentBid}
          onAddToBid={onAddToBid}
          onWithdrawBid={onWithdrawBid}
          transactionPending={transactionPending}
        />
      )}

      {!isActive && (canWithdraw || isHighestBidder) && (
        <Flex
          flexWrap="wrap"
          justifyContent={"center"}
          alignItems="center"
          m={2}
        >
          {canWithdraw && (
            <WithdrawBidButton
              canWithdraw={canWithdraw}
              currentBid={currentBid}
              onWithdrawBid={onWithdrawBid}
            />
          )}
          {isHighestBidder && <ClaimTokenButton />}
        </Flex>
      )}
    </Flex>
  );
};

export default Auction;

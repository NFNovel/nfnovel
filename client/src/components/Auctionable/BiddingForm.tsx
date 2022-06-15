import {
  Box,
  Button,
  Center,
  Divider,
  Flex,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Spacer,
  Stat,
  StatLabel,
  StatNumber,
} from "@chakra-ui/react";
import { BigNumber, ethers } from "ethers";
import { useState } from "react";

import useConnectedAccount from "src/hooks/use-connected-account";

import { convertToEth, convertToWei } from "./utils";

import type { Auction as AuctionType } from "src/types/auction";
import type { IUseAuctionable } from "./use-auctionable";

export const WithdrawBidButton = (props: {
  currentBid: BigNumber;
  canWithdraw: boolean;
  onWithdrawBid: IUseAuctionable["onWithdrawBid"];
}) => {
  const {
    currentBid,
    canWithdraw,
    onWithdrawBid
  } = props;

  const handleWithdrawBid = async () => {
    const success = await onWithdrawBid();
    /* TODO: use toaster */
  };

  const label = currentBid.isZero() ?
    "No bid to withdraw" :
    `Withdraw ${convertToEth(currentBid, true)}`;

  // TODO: disable if highest bidder
  return (
    <Box>
      <Button
        m={2}
        size={"lg"}
        variant={"outline"}
        flexBasis={"auto"}
        onClick={handleWithdrawBid}
        disabled={!canWithdraw}
      >
        {label}
      </Button>
    </Box>
  );
};

const BiddingForm = (props: {
  auction: AuctionType;
  isActive: IUseAuctionable["isActive"];
  currentBid: IUseAuctionable["currentBid"];
  onAddToBid: IUseAuctionable["onAddToBid"];
  onWithdrawBid: IUseAuctionable["onWithdrawBid"];
  transactionPending: IUseAuctionable["transactionPending"];
}) => {
  const {
    auction,
    isActive,
    currentBid,
    onAddToBid,
    onWithdrawBid,
    transactionPending,
  } = props;

  const { connectedAccount, ConnectAccountButtons } = useConnectedAccount();

  const [addToBidInWei, setAddToBidInWei] = useState<BigNumber>(
    auction.highestBid.add(auction.minimumBidIncrement),
  );

  const formatAddToBidValue = (
    amountInWei: BigNumber,
    asNumber = false,
  ): string | number => {
    const amountInEth = convertToEth(amountInWei);

    return asNumber ? Number(amountInEth) : amountInEth;
  };

  const handleAddToBidInput = (amountInEthText: string) => {
    const amountInEth = amountInEthText.replace(/ ETH/, "");
    if (!amountInEth) return;

    const amountInWei = convertToWei(amountInEth);
    setAddToBidInWei(amountInWei);
  };

  const handleAddToBid = async () => {
    // TODO: return { success, error } or dont catch and use try/catch in here
    // TODO: use toaster to indicate success/failure
    const success = await onAddToBid(addToBidInWei);

    // indicate success/failure
  };

  if (!connectedAccount) {
    return <ConnectAccountButtons />;
  }

  const totalBidInWei = currentBid ?
    currentBid.add(addToBidInWei) :
    addToBidInWei;

  const notEnoughForBidding = currentBid && totalBidInWei?.lte(auction.highestBid);

  const isHighestBidder = auction.highestBidder === connectedAccount.address;

  const canWithdraw = !isHighestBidder && currentBid.gt(0);

  const bidStepSize = auction.minimumBidIncrement.eq(0) ?
    convertToWei("0.01") :
    auction.minimumBidIncrement;

  const minimumAddToBidValue = auction.highestBid
    .add(auction.minimumBidIncrement)
    .sub(currentBid);

  return (
    <Box
      mt={2}
      mb={2}
    >
      <Flex
        wrap={"wrap"}
        justify="center"
        align={"center"}
        mt={2}
        mb={3}
        textAlign="center"
      >
        <Stat flexBasis={"auto"}>
          <StatLabel>Current Bid</StatLabel>
          <StatNumber>{convertToEth(currentBid, true)}</StatNumber>
        </Stat>
        <Stat flexBasis={"auto"}>
          <StatLabel>Add</StatLabel>
          <StatNumber>
            <Center>
              <NumberInput
                maxW={"100px"}
                onChange={handleAddToBidInput}
                precision={4}
                value={formatAddToBidValue(addToBidInWei)}
                step={formatAddToBidValue(bidStepSize, true) as number}
                defaultValue={formatAddToBidValue(minimumAddToBidValue)}
                min={formatAddToBidValue(minimumAddToBidValue, true) as number}
              >
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
            </Center>
          </StatNumber>
        </Stat>
        <Stat flexBasis={"auto"}>
          <StatLabel>Total Bid</StatLabel>
          <StatNumber>{convertToEth(totalBidInWei, true)}</StatNumber>
        </Stat>
      </Flex>
      <Divider />
      <Flex
        flexWrap="wrap"
        justifyContent={"center"}
        alignItems="center"
        mt={2}
      >
        <Center>
          <WithdrawBidButton
            currentBid={currentBid}
            canWithdraw={canWithdraw}
            onWithdrawBid={onWithdrawBid}
          />
          <Spacer />
          <Button
            m={2}
            size={"lg"}
            variant={"outline"}
            flexBasis={"auto"}
            disabled={!isActive}
            onClick={handleAddToBid}
          >
            Add to Bid
          </Button>
        </Center>
      </Flex>
    </Box>
  );
};

export default BiddingForm;

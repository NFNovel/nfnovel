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
import { BigNumber } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";

import useConnectedAccount from "src/hooks/use-connected-account";
import useToastMessage from "src/hooks/use-toast-message";

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
    onWithdrawBid,
  } = props;

  const {
    renderErrorToast,
    renderLoadingToast,
    renderSuccessToast,
  } = useToastMessage();

  const handleWithdrawBid = async () => {
    renderLoadingToast(
      "Transaction pending...",
      "Withdraw submitted to the network",
    );

    const { success, error } = await onWithdrawBid();

    if (success) renderSuccessToast("Withdraw successful!");
    else renderErrorToast("Withdraw failed", error);
  };

  const buttonText = currentBid.isZero() ?
    "No bid to withdraw" :
    `Withdraw ${convertToEth(currentBid, true)}`;

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
        {buttonText}
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
  } = props;

  const {
    renderErrorToast,
    renderLoadingToast,
    renderSuccessToast,
  } = useToastMessage();

  const {
    hasSigner,
    connectedAccount,
    ConnectAccountButtons,
  } = useConnectedAccount();

  // updates as auction / connected bidder data changes
  const computeMinimumAddToBidValue = useCallback(
    () => auction.highestBid.add(auction.minimumBidIncrement).sub(currentBid),
    [auction.highestBid, auction.minimumBidIncrement, currentBid],
  );

  const minimumAddToBidValue = useMemo(
    () => computeMinimumAddToBidValue(),
    [computeMinimumAddToBidValue],
  );

  const bidStepSize = useMemo(
    () =>
      auction.minimumBidIncrement.eq(0) ?
        convertToWei("0.001") :
        auction.minimumBidIncrement,
    [auction.minimumBidIncrement],
  );

  const [addToBidInWei, setAddToBidInWei] = useState<BigNumber>(minimumAddToBidValue);

  // when the minimum add to bid value changes then update to keep the form value consistent with current state of the auction
  useEffect(
    () => setAddToBidInWei(minimumAddToBidValue),
    [minimumAddToBidValue],
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

  const handleAddToBid = useCallback(async () => {
    renderLoadingToast(
      "Transaction pending...",
      "Waiting for signature to submit bid addition to the network",
    );

    const { success, error } = await onAddToBid(addToBidInWei);

    if (success) renderSuccessToast("Bid increment successful!");
    else renderErrorToast("Bid increment failed", error);
  }, [
    addToBidInWei,
    onAddToBid,
    renderErrorToast,
    renderLoadingToast,
    renderSuccessToast,
  ]);

  if (!connectedAccount) {
    return <ConnectAccountButtons />;
  }

  const totalBidInWei = currentBid ?
    currentBid.add(addToBidInWei) :
    addToBidInWei;

  const isHighestBidder = auction.highestBidder === connectedAccount.address;

  const canAddToBid = hasSigner && totalBidInWei.gte(minimumAddToBidValue);
  const canWithdraw = hasSigner && !isHighestBidder && currentBid.gt(0);

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
            disabled={!isActive || !canAddToBid}
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

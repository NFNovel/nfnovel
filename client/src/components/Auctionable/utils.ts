import { BigNumber, ethers } from "ethers";

import type { Auctionable } from "@evm/types/Auctionable";

import type { BigNumberish, EventFilter } from "ethers";

type HandledAuctionableEvent =
  | "AuctionBidRaised"
  | "AuctionBidWithdrawn"
  | "AuctionEnded";

type AuctionableEventFilters = {
  [filter in `filter${HandledAuctionableEvent}`]: EventFilter;
};

/**
 * filters on Auctionable events for current auction (by auctionId)
 * @param auctionableContract
 * @param auctionId
 * @returns
 */
export const buildAuctionFilters = (
  auctionableContract: Auctionable,
  auctionId: BigNumberish,
): AuctionableEventFilters => ({
  filterAuctionBidRaised:
    auctionableContract.filters.AuctionBidRaised(auctionId),
  filterAuctionBidWithdrawn:
    auctionableContract.filters.AuctionBidWithdrawn(auctionId),
  filterAuctionEnded: auctionableContract.filters.AuctionEnded(auctionId),
});

export const convertToEth = (amountInWei: BigNumberish, withCurrency = false) =>
  `${ethers.utils.formatEther(amountInWei)}${withCurrency ? " Ξ" : ""}`;

export const convertToWei = (amountInEth: string): BigNumber =>
  ethers.utils.parseEther(amountInEth);

export const handleTransactionError = (error: any) => {
  const errorOutput = { success: false, error: "Unknown error" };

  if (!error) return errorOutput;

  if (error.error) {
    const customError = extractCustomEVMError(error);
    if (customError) errorOutput.error = customError;
  }

  if (/must provide an Ethereum address/.test(error.message)) {
    errorOutput.error = "Wallet disconnected, check if it has become locked";
  }
};

export const extractCustomEVMError = (error: any) => {
  const message: string = error.error?.data?.message;
  if (!message) return null;

  const customErrorRe = /custom error '(?<customError>[A-Za-z]+)/;
  const match = message.match(customErrorRe);

  if (!match || !match.groups) return null;

  return match.groups.customError
    .replaceAll(/[A-Z]/g, (char) => ` ${char}`)
    .trim();
};

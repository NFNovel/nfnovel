import {
  Text,
  CircularProgress,
  CircularProgressLabel,
} from "@chakra-ui/react";

import type { Auction } from "src/types/auction";
import type { IUseAuctionable } from "./use-auctionable";

const RemainingTime = (props: {
  auction: Auction;
  timeRemaining: IUseAuctionable["timeRemaining"];
}) => {
  const { auction, timeRemaining } = props;

  const remainingSeconds = timeRemaining.toMillis() / 1000;
  const totalAuctionTime = auction.endTime.toNumber() - auction.startTime.toNumber();

  const progress = 100 * (1 - remainingSeconds / totalAuctionTime);

  const timeRemainingFormat = timeRemaining.minutes > 1 ? "hh 'h' mm 'm'" : "mm 'm' ss 's'";
  const timeRemainingFormatted = timeRemaining.toMillis() === 0 ?
    "Ended!" :
    timeRemaining.toFormat(timeRemainingFormat);

  return (
    <CircularProgress
      size="80px"
      value={progress}
      color={timeRemaining.toMillis() === 0 ? "red" : "blue"}
    >
      <CircularProgressLabel>
        <Text fontSize={"x-small"}>{timeRemainingFormatted}</Text>
      </CircularProgressLabel>
    </CircularProgress>
  );
};

export default RemainingTime;

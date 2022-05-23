import { Spinner } from "@blueprintjs/core";
import { Duration, DateTime } from "luxon";
import { useState, useEffect } from "react";
import { useInterval } from "src/utils/use-timers";

import type { Auction } from "src/types/auction";

const RemainingTime = (props: { auction: Auction; isOpen: boolean }) => {
  const { auction, isOpen } = props;
  const [timeRemaining, setTimeRemaining] = useState<Duration | null>(null);

  useInterval(
    () => {
      if (!auction) return;

      const _timeRemaining = DateTime.fromSeconds(
        auction.endTime.toNumber(),
      ).diffNow(["seconds", "hours", "minutes"]);
      
      setTimeRemaining(_timeRemaining);
    },
    isOpen ? 1000 : null,
  );

  // NOTE: reset so it doesnt "jump" when opened again (will force Spinner until correct endTime is loaded)
  useEffect(() => {
    if (!isOpen) setTimeRemaining(null);

    return () => {
      setTimeRemaining(null);
    };
  }, [isOpen]);

  if (!timeRemaining) return <Spinner />;

  const timeRemainingMessage = `Time remaining: ${timeRemaining.toFormat(
    "hh 'hours', mm 'minutes', ss 'seconds'",
  )}`;

  return (
    <div className="border-2 rounded-lg mt-10 h-10 p-2">
      {" "}
      <div>
        {auction.state !== 1 || timeRemaining.toMillis() <= 0 ?
          "Auction ended!" :
          timeRemainingMessage}
      </div>
    </div>
  );
};

export default RemainingTime;

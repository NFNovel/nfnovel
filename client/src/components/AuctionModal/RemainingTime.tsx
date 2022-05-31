import { Spinner } from "@blueprintjs/core";
import { Duration, DateTime } from "luxon";
import { useState, useEffect } from "react";
import { useInterval } from "src/utils/use-timers";

import type { Auction } from "src/types/auction";

const RemainingTime = (props: { auction: Auction }) => {
  const { auction } = props;
  const [timeRemaining, setTimeRemaining] = useState<Duration | null>(null);

  useInterval(() => {
    if (!auction) return;

    const _timeRemaining = DateTime.fromSeconds(
      auction.endTime.toNumber(),
    ).diffNow(["seconds", "hours", "minutes"]);

    setTimeRemaining(_timeRemaining);
  }, 1000);

  // NOTE: reset so it doesnt "jump" when opened again (will force Spinner until correct endTime is loaded)
  useEffect(() => {
    return () => {
      setTimeRemaining(null);
    };
  }, []);

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

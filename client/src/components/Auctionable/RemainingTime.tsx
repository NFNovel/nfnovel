import { Spinner } from "@blueprintjs/core";
import { Duration } from "luxon";

const RemainingTime = (props: { timeRemaining: Duration | null }) => {
  const { timeRemaining } = props;

  if (!timeRemaining) return <Spinner />;

  const timeRemainingMessage = `Time remaining: ${timeRemaining.toFormat(
    "hh 'hours', mm 'minutes', ss 'seconds'",
  )}`;

  return (
    <div className="border-2 rounded-lg mt-10 h-10 p-2">
      <div>
        {timeRemaining.toMillis() <= 0 ?
          "Auction ended!" :
          timeRemainingMessage}
      </div>
    </div>
  );
};

export default RemainingTime;

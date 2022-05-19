import { useEffect, useRef } from "react";

type UseTimerCallback = (...args: unknown[]) => void | Promise<void>;

// credit: the legend himself, https://overreacted.io/making-setinterval-declarative-with-react-hooks/
export const useInterval = (
  callback: UseTimerCallback,
  delay: number | null,
) => {
  const savedCallback = useRef<UseTimerCallback>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval.
  useEffect(() => {
    const tick = () => {
      if (!savedCallback.current) return;
      savedCallback.current();
    };

    if (delay !== null) {
      const intervalId = setInterval(tick, delay);

      return () => clearInterval(intervalId);
    }
  }, [delay]);
};

// credit: https://www.joshwcomeau.com/snippets/react-hooks/use-timeout/
export const useTimeout = (
  callback: UseTimerCallback,
  delay: number | null,
) => {
  const savedCallback = useRef<UseTimerCallback>();
  const savedTimeoutId = useRef<NodeJS.Timeout>();

  // Remember the latest callback.
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the timeout.
  useEffect(() => {
    const tick = () => {
      if (!savedCallback.current) return;
      savedCallback.current();
    };

    if (delay !== null) {
      savedTimeoutId.current = setTimeout(tick, delay);

      return () => {
        if (!savedTimeoutId.current) return;
        clearTimeout(savedTimeoutId.current);
      };
    }
  }, [delay]);
};

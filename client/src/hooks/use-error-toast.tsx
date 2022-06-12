import { ToastId, useToast, UseToastOptions } from "@chakra-ui/react";
import { useRef } from "react";

const useErrorToast = (
  options?: Omit<
  UseToastOptions,
  "title" | "position" | "description" | "status"
  >,
) => {
  const baseConfig: UseToastOptions = {
    title: "Error",
    status: "error",
    position: "bottom-right",
    description: "Unknown error :(",
  };

  const errorToast = useToast(
    options ? { ...baseConfig, ...options } : baseConfig,
  );

  const activeToastRef = useRef<ToastId>();

  const renderErrorToast = (errorMessage?: string | JSX.Element) => {
    if (
      // if not presented yet
      !activeToastRef.current ||
      // or if no longer active (prevent duplicates)
      // https://chakra-ui.com/docs/components/feedback/toast#preventing-duplicate-toast
      !errorToast.isActive(activeToastRef.current)
    ) {
      activeToastRef.current = errorToast(
        errorMessage ? { description: errorMessage } : {},
      );
    }
  };

  return {
    renderErrorToast,
  };
};

export default useErrorToast;

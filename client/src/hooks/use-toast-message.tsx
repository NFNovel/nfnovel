import { ToastId, useToast, UseToastOptions } from "@chakra-ui/react";
import { useRef } from "react";

type UseToastMessageOptions = Omit<UseToastOptions, "position" | "status">;

export const useToastMessage = (options?: UseToastMessageOptions) => {
  const baseConfig: UseToastOptions = {
    position: "bottom-right",
  };

  const errorToastRef = useRef<ToastId>();

  const baseErrorConfig: UseToastOptions = {
    ...baseConfig,
    status: "error",
    description: "Unknown error :(",
  };

  const errorToast = useToast(
    options ? { ...baseErrorConfig, ...options } : baseErrorConfig,
  );

  const loadingToastRef = useRef<ToastId>();

  const baseLoadingConfig: UseToastOptions = {
    ...baseConfig,
    status: "loading",
  };

  const loadingToast = useToast(
    options ? { ...baseLoadingConfig, ...options } : baseLoadingConfig,
  );

  const successToastRef = useRef<ToastId>();

  const baseSuccessConfig: UseToastOptions = {
    ...baseConfig,
    status: "success",
  };

  const successToast = useToast(
    options ? { ...baseSuccessConfig, ...options } : baseSuccessConfig,
  );

  const renderErrorToast = (
    title = "Error",
    description: string | JSX.Element | null = "Unknown error :(",
  ) => {
    if (
      // if not presented yet
      !errorToastRef.current ||
      // or if no longer active (prevent duplicates)
      // https://chakra-ui.com/docs/components/feedback/toast#preventing-duplicate-toast
      !errorToast.isActive(errorToastRef.current)
    ) {
      errorToastRef.current = errorToast({ title, description });
    }
  };

  const renderLoadingToast = (
    title = "Loading...",
    description: string | JSX.Element | null = "",
  ) => {
    if (
      !loadingToastRef.current ||
      !loadingToast.isActive(loadingToastRef.current)
    ) {
      loadingToastRef.current = loadingToast({ title, description });
    }
  };

  const renderSuccessToast = (
    title = "Success!",
    description: string | JSX.Element | null = "",
  ) => {
    if (
      // if not presented yet
      !successToastRef.current ||
      // or if no longer active (prevent duplicates)
      // https://chakra-ui.com/docs/components/feedback/toast#preventing-duplicate-toast
      !successToast.isActive(successToastRef.current)
    ) {
      successToastRef.current = successToast({ title, description });
    }
  };

  return {
    renderErrorToast,
    renderLoadingToast,
    renderSuccessToast,
  };
};

export default useToastMessage;

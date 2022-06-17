import { Button, ButtonProps } from "@chakra-ui/react";
import React from "react";

// TODO: override global chakra theme for things like this
// https://chakra-ui.com/docs/styled-system/theming/customize-theme#customizing-component-styles
const StyledButton = (
  props: ButtonProps & { buttonText?: string; children?: React.ReactNode },
) => {
  const {
    children,
    buttonText,
    ...buttonProps
  } = props;

  return (
    <Button
      m={2}
      size={"lg"}
      variant={"outline"}
      flexBasis={"auto"}
      {...buttonProps}
    >
      {buttonText || children}
    </Button>
  );
};

export default StyledButton;

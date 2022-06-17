import React from "react";
import { Box } from "@chakra-ui/react";

import Nav from "./Nav/Nav";

type LayoutProps = {
  children: React.ReactNode;
};

const Layout = (props: LayoutProps) => {
  const { children } = props;

  return (
    <Box>
      <Nav />
      {children}
    </Box>
  );
};

export default Layout;

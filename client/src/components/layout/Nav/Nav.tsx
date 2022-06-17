// https://chakra-templates.dev/navigation/navbar
import {
  Box,
  Flex,
  Button,
  useColorModeValue,
  Stack,
  useColorMode,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import React from "react";

import IPFSStatus from "./IPFSStatus";
import Web3LoginMenu from "./Web3LoginMenu";

export default function Nav() {
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <Box
      bg={useColorModeValue("gray.100", "gray.900")}
      px={4}
    >
      <Flex
        h={16}
        alignItems={"center"}
        justifyContent={"space-between"}
      >
        <Box>LOGO</Box>

        <Flex alignItems={"center"}>
          <Stack
            direction={"row"}
            spacing={4}
          >
            <IPFSStatus />

            <Web3LoginMenu />

            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
}

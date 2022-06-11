// https://chakra-templates.dev/navigation/navbar
import {
  Box,
  Flex,
  Avatar,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useColorModeValue,
  Stack,
  useColorMode,
  Center,
  Text,
  Badge,
  Tooltip,
  ThemingProps,
  Icon,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FaEthereum } from "react-icons/fa";
import React, { useMemo } from "react";

import useConnectedAccount from "src/hooks/use-connected-account";
import useIpfs, { UseIpfsOutput } from "src/hooks/use-ipfs";
import { IpfsContext } from "src/contexts/ipfs-context";

import type { IPFS } from "ipfs-core";

type IPFSStatusProps = Pick<UseIpfsOutput, "status" | "nodeDetails">;

const IPFSStatus = (props: IPFSStatusProps) => {
  const { status, nodeDetails } = props;

  const statusDisplays = useMemo<{
    [key in IPFSStatusProps["status"]]: {
      colorScheme: ThemingProps<"Badge">["colorScheme"];
      // icon: React.ReactNode;
    };
  }>(
    () => ({
      error: {
        colorScheme: "red",
        // icon: <NotAllowedIcon />,
      },
      connected: {
        colorScheme: "green",
        // icon: <CheckCircleIcon />,
      },
      connecting: {
        colorScheme: "yellow",
        // icon: <SpinnerIcon />,
      },
    }),
    [],
  );

  const statusDisplay = statusDisplays[status];

  return (
    <Tooltip
      isDisabled={!nodeDetails}
      label={<Text>Node ID {nodeDetails?.id}</Text>}
    >
      <Center>
        <Text fontWeight="bold">
          IPFS
          <Badge
            ml={2}
            variant="subtle"
            colorScheme={statusDisplay.colorScheme}
          >
            {status.toUpperCase()}
          </Badge>
        </Text>
      </Center>
    </Tooltip>
  );
};

export default function Nav() {
  const { status, nodeDetails } = useIpfs();
  const { colorMode, toggleColorMode } = useColorMode();

  // TODO: wire up
  const { connectedAccount, ConnectAccountButtons } = useConnectedAccount();

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
        <Box>LOGO PLACEHOLDER</Box>

        <Flex alignItems={"center"}>
          <Stack
            direction={"row"}
            spacing={4}
          >
            <IPFSStatus
              status={status}
              nodeDetails={nodeDetails}
            />

            <Menu>
              <MenuButton as={Button}>
                <Icon
                  as={FaEthereum}
                  boxSize="1.25em"
                  color="orange.400"
                />
              </MenuButton>
              <MenuList alignItems={"center"}>
                <br />
                <Center>
                  {/* 
                    - chain ID
                    - current balance
                    - truncated address

                    ||

                    - login buttons
                  */}
                  <Avatar
                    size={"2xl"}
                    src={"https://avatars.dicebear.com/api/male/username.svg"}
                  />
                </Center>
                <br />
                <Center>
                  <p>Username</p>
                </Center>
                <br />
                <MenuDivider />
                <MenuItem>Your Servers</MenuItem>
                <MenuItem>Account Settings</MenuItem>
                <MenuItem>Logout</MenuItem>
              </MenuList>
            </Menu>

            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
}

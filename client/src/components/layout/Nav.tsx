// https://chakra-templates.dev/navigation/navbar
import {
  Box,
  Flex,
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
  ThemingProps,
  Icon,
  Stat,
  StatLabel,
  StatNumber,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  TableCaption,
  StatHelpText,
  Tag,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";
import { FaEthereum } from "react-icons/fa";
import React, { useEffect } from "react";
import { useNetwork, useProvider } from "wagmi";

import useConnectedAccount from "src/hooks/use-connected-account";
import useIpfs, { UseIpfsOutput } from "src/hooks/use-ipfs";
import { IConnectedAccount } from "src/contexts/connected-account-context";
import useErrorToast from "src/hooks/use-error-toast";

const ipfsStatusColors: {
  [key in UseIpfsOutput["status"]]: {
    colorScheme: ThemingProps<"Badge">["colorScheme"];
    // icon: React.ReactNode;
  };
} = {
  error: {
    colorScheme: "red",
  },
  connected: {
    colorScheme: "green",
  },
  connecting: {
    colorScheme: "yellow",
  },
};

const IPFSStatus = () => {
  const { status } = useIpfs();

  const statusDisplay = ipfsStatusColors[status];

  return (
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
  );
};

const ConnectedAccountDetails = (props: {
  connectedAccount: IConnectedAccount;
}) => {
  const { connectedAccount } = props;

  const { network } = useProvider();
  const { activeChain } = useNetwork();
  const { renderErrorToast } = useErrorToast({
    duration: 10 * 1000,
  });

  const networkIsSupported = activeChain?.id === network.chainId;
  const truncatedAddress = `${connectedAccount.address.slice(0, 6)}...`;

  useEffect(() => {
    if (!networkIsSupported) {
      const UnsupportedNetworkMessage = () => (
        <Text>
          Network <Tag color={"black"}>{activeChain?.name}</Tag> [
          <Tag color={"black"}>{activeChain?.id}</Tag>] is not supported. Change
          networks with your wallet to <Tag color={"black"}>{network.name}</Tag>{" "}
          [<Tag color={"black"}>{network.chainId}</Tag>]
        </Text>
      );
      renderErrorToast(<UnsupportedNetworkMessage />);
    }
  }, [activeChain, network, networkIsSupported, renderErrorToast]);

  return (
    <Box>
      <TableContainer>
        <Table
          size="sm"
          variant="unstyled"
        >
          <Thead>
            <Tr>
              <Th>Network</Th>
              <Th>Chain ID</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td alignContent={"center"}>
                <Badge colorScheme={networkIsSupported ? "green" : "red"}>
                  {activeChain?.name}
                </Badge>
              </Td>
              <Td alignContent={"center"}>
                <Badge colorScheme={networkIsSupported ? "green" : "red"}>
                  {activeChain?.id}
                </Badge>
              </Td>
            </Tr>
          </Tbody>
          <TableCaption>
            <Center>
              Connected as: <Badge ml={2}>{truncatedAddress}</Badge>
            </Center>
          </TableCaption>
        </Table>
      </TableContainer>

      <MenuDivider />
      <Stat textAlign={"center"}>
        <StatHelpText>
          <Badge colorScheme={connectedAccount.isPanelOwner ? "green" : "red"}>
            {connectedAccount.isPanelOwner ? "OWNER" : "NOT AN OWNER"}
          </Badge>
        </StatHelpText>
        {connectedAccount.isPanelOwner && (
          <>
            <StatLabel>Owned Panels</StatLabel>
            <StatNumber>
              {connectedAccount.ownedPanelTokenIds.length}
            </StatNumber>
          </>
        )}
      </Stat>

      {connectedAccount.isPanelOwner && (
        <>
          <MenuDivider />
          {/* TODO: add auth context and SIWE */}
          <MenuItem>Authenticate as Owner</MenuItem>
        </>
      )}
    </Box>
  );
};

const Web3Login = () => {
  const { connectedAccount, ConnectAccountButtons } = useConnectedAccount();

  return (
    <Menu>
      <MenuButton as={Button}>
        <Icon
          as={FaEthereum}
          boxSize="1.25em"
          color="orange.400"
        />
      </MenuButton>
      <MenuList>
        {connectedAccount ? (
          <ConnectedAccountDetails connectedAccount={connectedAccount} />
        ) : (
          <ConnectAccountButtons />
        )}
      </MenuList>
    </Menu>
  );
};

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

            <Web3Login />

            <Button onClick={toggleColorMode}>
              {colorMode === "light" ? <MoonIcon /> : <SunIcon />}
            </Button>
          </Stack>
        </Flex>
      </Flex>
    </Box>
  );
}

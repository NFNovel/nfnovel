import {
  Tag,
  Box,
  TableContainer,
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Badge,
  TableCaption,
  Center,
  MenuDivider,
  Stat,
  StatHelpText,
  StatLabel,
  StatNumber,
  MenuItem,
  Menu,
  MenuButton,
  Button,
  Icon,
  Text,
  MenuList,
} from "@chakra-ui/react";
import { useEffect } from "react";
import { FaEthereum } from "react-icons/fa";
import { useProvider, useNetwork } from "wagmi";

import { IConnectedAccount } from "src/contexts/connected-account-context";
import useConnectedAccount from "src/hooks/use-connected-account";
import useToastMessage from "src/hooks/use-toast-message";

const UnsupportedNetworkMessage = (props: {
  networkName: string;
  networkId: number;
  activeChainName: string;
  activeChainId: number;
}) => {
  const {
    networkId,
    networkName,
    activeChainId,
    activeChainName,
  } = props;

  return (
    <Text>
      Network{" "}
      <Tag
        variant={"solid"}
        color={"black"}
      >
        {activeChainName}
      </Tag>{" "}
      [
      <Tag
        variant={"solid"}
        color={"black"}
      >
        {activeChainId}
      </Tag>
      ] is not supported. Change networks with your wallet to{" "}
      <Tag
        variant={"solid"}
        color={"black"}
      >
        {networkName}
      </Tag>{" "}
      [
      <Tag
        variant={"solid"}
        color={"black"}
      >
        {networkId}
      </Tag>
      ]
    </Text>
  );
};

const ConnectedAccountDetails = (props: {
  connectedAccount: IConnectedAccount;
}) => {
  const { connectedAccount } = props;

  const { network } = useProvider();
  const { activeChain } = useNetwork();
  const { renderErrorToast, closeErrorToast } = useToastMessage({});

  const networkIsSupported = activeChain?.id === network.chainId;
  const truncatedAddress = `${connectedAccount.address.slice(0, 6)}...`;

  useEffect(() => {
    if (!activeChain) return;

    if (networkIsSupported) {
      closeErrorToast();
    } else {
      renderErrorToast(
        "Unsupported Network",
        <UnsupportedNetworkMessage
          networkId={network.chainId}
          networkName={network.name}
          activeChainId={activeChain.id}
          activeChainName={activeChain.name}
        />,
        null,
      );
    }
  }, [
    activeChain,
    network,
    networkIsSupported,
    renderErrorToast,
    closeErrorToast,
  ]);

  return (
    <Box>
      <TableContainer>
        {!networkIsSupported && (
          <Center my={2}>
            <Badge colorScheme={"red"}>Unsupported</Badge>
          </Center>
        )}
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
        </Table>
      </TableContainer>

      <MenuDivider />

      <Center>
        Connected as: <Badge ml={2}>{truncatedAddress}</Badge>
      </Center>

      <MenuDivider />

      <Stat textAlign={"center"}>
        <StatHelpText>
          <Badge colorScheme={connectedAccount.isPanelOwner ? "green" : "gray"}>
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
          <MenuItem justifyContent={"center"}>Authenticate as Owner</MenuItem>
        </>
      )}
    </Box>
  );
};

const Web3LoginMenu = () => {
  const { connectedAccount, ConnectAccountButtons } = useConnectedAccount();

  return (
    <Menu closeOnBlur={true}>
      <MenuButton as={Button}>
        <Icon
          as={FaEthereum}
          boxSize="1.25em"
          color="orange.400"
        />
      </MenuButton>
      <MenuList textAlign={"center"}>
        <Center>
          {connectedAccount ? (
            <ConnectedAccountDetails connectedAccount={connectedAccount} />
          ) : (
            <ConnectAccountButtons />
          )}
        </Center>
      </MenuList>
    </Menu>
  );
};

export default Web3LoginMenu;

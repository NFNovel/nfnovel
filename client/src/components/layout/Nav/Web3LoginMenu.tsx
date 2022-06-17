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
        variant={"outline"}
        color={"black"}
      >
        {activeChainName}
      </Tag>{" "}
      [
      <Tag
        variant={"outline"}
        color={"black"}
      >
        {activeChainId}
      </Tag>
      ] is not supported. Change networks with your wallet to{" "}
      <Tag
        variant={"outline"}
        color={"black"}
      >
        {networkName}
      </Tag>{" "}
      [
      <Tag
        variant={"outline"}
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
  const { renderErrorToast } = useToastMessage({});

  const networkIsSupported = activeChain?.id === network.chainId;
  const truncatedAddress = `${connectedAccount.address.slice(0, 6)}...`;

  useEffect(() => {
    if (!networkIsSupported && activeChain) {
      renderErrorToast(
        "Unsupported Network",
        <UnsupportedNetworkMessage
          networkId={network.chainId}
          networkName={network.name}
          activeChainId={activeChain.id}
          activeChainName={activeChain.name}
        />,
      );
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

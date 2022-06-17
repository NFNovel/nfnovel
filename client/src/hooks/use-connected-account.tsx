import { useConnect } from "wagmi";
import { useContext } from "react";
import { Flex, Icon, Center } from "@chakra-ui/react";
import { FaChrome, FaFirefox } from "react-icons/fa";

import { ConnectedAccountContext } from "src/contexts/connected-account-context";
import StyledButton from "src/components/StyledButton";

import type { IConnectedAccountContext } from "src/contexts/connected-account-context";

const ConnectAccountButtons = () => {
  const {
    connect,
    connectors,
    isConnecting,
    pendingConnector,
  } = useConnect();

  if (!window.ethereum)
    return (
      <Flex
        mt={2}
        maxW={"100vw"}
        flexWrap="wrap"
        alignItems="center"
        justifyContent="center"
        textAlign={"center"}
      >
        <StyledButton>
          <a
            href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
            target="_blank"
            rel="noreferrer noopener"
          >
            Install Metamask{" "}
            <Center>
              <Icon as={FaChrome} />
            </Center>
          </a>
        </StyledButton>
        <StyledButton>
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/"
            target="_blank"
            rel="noreferrer noopener"
          >
            Install Metamask{" "}
            <Center>
              <Icon as={FaFirefox} />
            </Center>
          </a>
        </StyledButton>
      </Flex>
    );

  return (
    <Flex
      mt={2}
      maxW={"100vw"}
      flexWrap="wrap"
      alignItems="center"
      justifyContent="center"
      textAlign={"center"}
    >
      <Center>
        {connectors.map((connector) =>
          connector.ready ? (
            <StyledButton
              disabled={
                !connector.ready ||
                (isConnecting && connector.id === pendingConnector?.id)
              }
              key={connector.id}
              onClick={() => connect(connector)}
              isLoading={isConnecting && connector.id === pendingConnector?.id}
              buttonText={`Connect with ${connector.name}`}
            />
          ) : null,
        )}
      </Center>
    </Flex>
  );
};

const useConnectedAccount = (): IConnectedAccountContext & {
  ConnectAccountButtons: () => JSX.Element;
} => {
  const { connectedAccount, updateConnectedAccount } = useContext(
    ConnectedAccountContext,
  );

  return { connectedAccount, updateConnectedAccount, ConnectAccountButtons };
};

export default useConnectedAccount;

import { useConnect } from "wagmi";
import { useContext } from "react";
import { ButtonGroup, Button, Spinner } from "@chakra-ui/react";

import { ConnectedAccountContext } from "src/contexts/connected-account-context";

import type { IConnectedAccountContext } from "src/contexts/connected-account-context";

// TODO: ref to match formatting of buttons in Auction/BiddingForm
// TODO: create a pre-style button for consistency or change global theme
const ConnectAccountButtons = () => {
  const {
    error,
    connect,
    connectors,
    isConnecting,
    pendingConnector,
  } = useConnect();

  if (!window.ethereum)
    return (
      <ButtonGroup>
        <Button>
          <a
            href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
            target="_blank"
            rel="noreferrer noopener"
          >
            Install Metamask (Chrome)
          </a>
        </Button>
        <Button>
          <a
            href="https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/"
            target="_blank"
            rel="noreferrer noopener"
          >
            Install Metamask (Firefox)
          </a>
        </Button>
      </ButtonGroup>
    );

  return (
    <ButtonGroup>
      {connectors.map((connector) => (
        <Button
          disabled={
            !connector.ready ||
            (isConnecting && connector.id === pendingConnector?.id)
          }
          key={connector.id}
          onClick={() => connect(connector)}
        >
          Connect with {connector.name}
          {!connector.ready && " (unsupported)"}
          {isConnecting && connector.id === pendingConnector?.id && <Spinner />}
        </Button>
      ))}

      {error && <div>{error.message}</div>}
    </ButtonGroup>
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

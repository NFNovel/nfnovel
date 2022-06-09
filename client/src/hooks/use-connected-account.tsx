import { useConnect } from "wagmi";
import { useContext } from "react";
import { ButtonGroup, Button } from "@chakra-ui/react";

import { ConnectedAccountContext } from "src/contexts/connected-account-context";

import type { IConnectedAccount } from "src/contexts/connected-account-context";

const ConnectAccountButtons = () => {
  const {
    error,
    connect,
    connectors,
    isConnecting,
    pendingConnector
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
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect(connector)}
        >
          Connect with {connector.name}
          {!connector.ready && " (unsupported)"}
          {isConnecting &&
            connector.id === pendingConnector?.id &&
            " (connecting)"}
        </Button>
      ))}

      {error && <div>{error.message}</div>}
    </ButtonGroup>
  );
};

const useConnectedAccount = (): {
  connectedAccount: IConnectedAccount | null;
  ConnectAccountButtons: () => JSX.Element;
} => {
  const { connectedAccount } = useContext(ConnectedAccountContext);

  return { connectedAccount, ConnectAccountButtons };
};

export default useConnectedAccount;

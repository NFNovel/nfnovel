import { useConnect } from "wagmi";
import { useContext } from "react";
import { ButtonGroup, Button } from "@blueprintjs/core";
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

  return (
    <ButtonGroup>
      {connectors.map((connector) => (
        <Button
          disabled={!connector.ready}
          key={connector.id}
          onClick={() => connect(connector)}
        >
          {connector.name}
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

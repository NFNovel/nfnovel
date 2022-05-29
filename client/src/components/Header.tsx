import React from "react";
import { useConnect } from "wagmi";
import {
  Alignment,
  Button,
  ButtonGroup,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
} from "@blueprintjs/core";
import useConnectedAccount from "src/hooks/use-connected-account";

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

function Header() {
  const connectedAccount = useConnectedAccount();

  const shortAccountAddress = connectedAccount?.address.substring(0, 6) +
    "..." +
    connectedAccount?.address.substring(37, 41);

  return (
    <Navbar>
      <NavbarGroup align={Alignment.RIGHT}>
        <NavbarHeading>NFNovel</NavbarHeading>
        <NavbarDivider />
        {connectedAccount ? (
          <Button
            className="bp4-minimal"
            text={shortAccountAddress}
          ></Button>
        ) : (
          <ConnectAccountButtons />
        )}
      </NavbarGroup>
    </Navbar>
  );
}

export default Header;

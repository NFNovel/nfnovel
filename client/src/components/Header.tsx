import React from "react";
import { useContext } from "react";
import {
  Alignment,
  Button,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
} from "@blueprintjs/core";
import { NFNovelContext } from "src/contexts/nfnovel-context";
import { connectToMetamask } from "src/utils/connect-metamask";

function Header() {
  const {
    connectedAccount,
    metamaskProvider,
    connectContractToSigner
  } = useContext(NFNovelContext);

  const shortAccountAddress = connectedAccount?.address.substring(0, 6) +
    "..." +
    connectedAccount?.address.substring(37, 41);

  const connectWallet = async () => {
    if (!metamaskProvider) {
      console.log("metamask not available");

      return;
    }
    const connectedAccount = await connectToMetamask(metamaskProvider);
    if (!connectedAccount) {
      console.log("failed to connect to account");

      return;
    }

    connectContractToSigner(connectedAccount);
  };

  // THINK: consider having 3 potential "buttons"
  // connected (truncated address), connect, metamask not found

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
          <Button
            className="bp4-minimal"
            text="Connect to MetaMask"
            onClick={connectWallet}
            disabled={!metamaskProvider}
          ></Button>
        )}
      </NavbarGroup>
    </Navbar>
  );
}

export default Header;

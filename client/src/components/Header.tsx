import {
  Alignment,
  Button,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
} from "@blueprintjs/core";
import useConnectedAccount from "src/hooks/use-connected-account";

function Header() {
  const { connectedAccount, ConnectAccountButtons } = useConnectedAccount();

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

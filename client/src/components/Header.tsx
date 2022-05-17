import React from "react";
import Image from "next/image";
import { useContext } from "react";
import { SearchIcon } from "@heroicons/react/outline";
import {
  Alignment,
  Button,
  Classes,
  H5,
  Navbar,
  NavbarDivider,
  NavbarGroup,
  NavbarHeading,
  Switch,
  Icon,
} from "@blueprintjs/core";

import AccountContext from "./AccountContext";

function Header() {
  const account = useContext(AccountContext);

  const shortAccountAdr = account.publicKey.substring(0, 6) +
    "..." +
    account.publicKey.substring(37, 41);

  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Get MetaMask!");

        return;
      }

      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected", accounts[0]);

      account.setPublicKey(accounts[0]);

      //setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <Navbar>
      <NavbarGroup align={Alignment.RIGHT}>
        <NavbarHeading>NFNovel</NavbarHeading>
        <NavbarDivider />
        {account.publicKey ? (
          <Button
            className="bp4-minimal"
            text={shortAccountAdr}
          ></Button>
        ) : (
          <Button
            className="bp4-minimal"
            text="Connect to MetaMask"
            onClick={connectWallet}
          ></Button>
        )}
      </NavbarGroup>
    </Navbar>
  );
}

export default Header;

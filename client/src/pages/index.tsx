import styles from "@styles/Home.module.css";
import { useState, useEffect } from "react";
import AccountContext from "src/components/AccountContext";
import Novel from "src/components/Novel";

import Header from "../components/Header";

import type { NextPage } from "next";
import type { BigNumber, Signer } from "ethers";
import type { Web3Provider } from "@ethersproject/providers";

const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState("");

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");

        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account);
      } else {
        console.log("No authorized account found");
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  return (
    <AccountContext.Provider
      value={{ publicKey: currentAccount, setPublicKey: setCurrentAccount }}
    >
      <Header />
      <Novel
        summary={"Summary of the novel"}
        title={"Some title for the novel"}
        author={"random_auth"}
        id={1}
      />
    </AccountContext.Provider>
  );
};

export default Home;

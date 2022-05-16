import "@styles/globals.css";
import { useEffect, useState } from "react";
import AccountContext from "src/components/AccountContext";
import Novel from "src/components/Novel";

import Header from "../components/Header";

import type { AppProps } from "next/app";

function MyApp({ Component, pageProps }: AppProps) {
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
      <Component {...pageProps} />
    </AccountContext.Provider>
  );
}

export default MyApp;

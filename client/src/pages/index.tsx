import styles from "@styles/Home.module.css";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

import type { NextPage } from "next";
import type { BigNumber, Signer } from "ethers";
import type { Web3Provider } from "@ethersproject/providers";

const Home: NextPage = () => {
  const [provider, setProvider] = useState<Web3Provider>();
  const [signer, setSigner] = useState<Signer>();
  const [account, setAccount] = useState<{
    address: string;
    balanceEth: string;
    balanceWei: BigNumber;
  }>();
  const [metamaskError, setMetamaskError] = useState(false);

  useEffect(() => {
    // thank you to: https://bobbyhadz.com/blog/typescript-property-does-not-exist-on-type-window
    // fix for ethereum doesnt exist on type Window
    if (typeof window.ethereum === "undefined") {
      return setMetamaskError(true);
    }
  }, []);

  // https://docs.ethers.io/v5/getting-started/#getting-started--connecting
  const connectMetamask = async () => {
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    await provider.send("eth_requestAccounts", []);

    const signer = await provider.getSigner();

    const address = await signer.getAddress();
    const balanceWei = await signer.getBalance();
    const balanceEth = ethers.utils.formatEther(balanceWei);

    setProvider(provider);
    setSigner(signer);
    setAccount({ address, balanceWei, balanceEth });
  };

  if (metamaskError)
    return (
      <div className={styles.container}>
        <p>Browser does not have metamask.</p>
      </div>
    );

  if (!provider || !signer || !account)
    return (
      <div className={styles.container}>
        <button onClick={connectMetamask}>Connect to MetaMask</button>
      </div>
    );

  return (
    <div className={styles.container}>
      Connected to Account:
      <p>address: {account.address}</p>
      <p>balance (wei): {account.balanceWei.toString()}</p>
      <p>balance (ETH): {account.balanceEth}</p>
    </div>
  );
};

export default Home;

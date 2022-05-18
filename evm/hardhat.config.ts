import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import NFNovelDeployment from "./deployments/NFNovel.json";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

task("revealPage", "Reveals the page")
  .addParam<number>("page", "the page number to reveal")
  .setAction(async (taskArgs: { page: number }, hre) => {
    const pageNumber = taskArgs.page;

    const nfnovel = await hre.ethers.getContractAt(
      "NFNovel",
      NFNovelDeployment.contractAddress
    );

    if (NFNovelDeployment.network.chainId !== hre.network.config.chainId)
      return console.log(
        "must be called on same network the contract is deployed to:",
        NFNovelDeployment.network
      );

    const revealedBaseURIs: { [pageNumber: string]: string } = {
      // cover
      1: "ipfs://QmcLP748DuiaWhky7kmi4VPL7r6LGV5njyzZ6HdusvhfBR",
      // first page
      2: "ipfs://QmQJB2d9EQDiLMXQNsiVk6PCRYGbXMwiNkyrNK4HSpwCBL",
    };

    const revealedBaseURI = revealedBaseURIs[pageNumber];

    if (!revealedBaseURI)
      return console.log("Invalid page number, no base URI found");

    try {
      await nfnovel.revealPage(pageNumber, revealedBaseURI);
      console.log(
        `page [${pageNumber}] revealed with base URI [${revealedBaseURI}]`
      );
    } catch (error: any) {
      console.log("failed to reveal page", error.message);
    }
  });

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;

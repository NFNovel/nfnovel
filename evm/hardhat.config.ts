import * as dotenv from "dotenv";

import { HardhatUserConfig, task } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "@typechain/hardhat";
import "hardhat-gas-reporter";
import "solidity-coverage";

import NFNovelDeployment from "./deployments/NFNovel.json";
import { BigNumber } from "ethers";

dotenv.config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// NOTE: fix import from utils, circular import from hardhat/ethers ---> https://hardhat.org/errors/#HH9
task("endPanelAuction", "Ends Panel Auction")
  .addParam<number>("panelAuctionId", "auction to end")
  .setAction(async (taskArgs: { panelAuctionId: number }, hre) => {
    const panelAuctionId = taskArgs.panelAuctionId;

    const nfnovel = await hre.ethers.getContractAt(
      "NFNovel",
      NFNovelDeployment.contractAddress
    );

    try {
      const auctionEndTime = (await nfnovel.auctions(panelAuctionId)).endTime;

      const currentBlockNumber = await hre.ethers.provider.getBlockNumber();
      const currentBlock = await hre.ethers.provider.getBlock(
        currentBlockNumber
      );
      const currentBlockTime = BigNumber.from(currentBlock.timestamp);
      const blockTimeIncrement = auctionEndTime.sub(currentBlockTime);

      if (blockTimeIncrement.gt(0)) {
        const currentTimestamp = currentBlock.timestamp;
        const nextBlockTimestamp = BigNumber.isBigNumber(blockTimeIncrement)
          ? blockTimeIncrement.add(currentTimestamp).toNumber()
          : currentTimestamp + blockTimeIncrement;

        await hre.ethers.provider.send("evm_mine", [nextBlockTimestamp]);
      }

      await nfnovel.endPanelAuction(panelAuctionId);
      console.log(`Auction [${panelAuctionId}] ended`);
    } catch (error: any) {
      console.log("failed to end auction", error.message);
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
      2: "ipfs://QmXa2JNSeLTznLFf3UpUXpoDygKAdMX2v92iFAdEDNJTp4",
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

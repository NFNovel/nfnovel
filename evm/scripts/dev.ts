import { deployContracts } from "./utils/deploy";
import { addPages } from "./utils/add-pages";
import { ethers } from "hardhat";

async function devSetup(): Promise<void> {
  /**
   * 1. deploy the contrac(s)
   * 2. add the pages
   */
  const deployments = await deployContracts();

  const nfnovel = await ethers.getContractAt(
    "NFNovel",
    deployments.NFNovel.contractAddress
  );

  // set defaults BEFORE adding pages (which creates panel auctions)
  await nfnovel.setAuctionDefaults({
    duration: 2 * 60,
    startingValue: 2,
    minimumBidValue: 0,
  });

  await addPages(deployments.NFNovel.contractAddress);
}

devSetup().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export default devSetup;

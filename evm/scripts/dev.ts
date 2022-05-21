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
    duration: 30 * 60,
    minimumBidIncrement: 0,
    startingValue: ethers.constants.WeiPerEther.mul(2),
  });

  await addPages(deployments.NFNovel.contractAddress);
}

devSetup().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export default devSetup;

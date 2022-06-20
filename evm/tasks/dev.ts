import { task } from "hardhat/config";
import { setTimeout } from "timers/promises";
import type { HardhatRuntimeEnvironment } from "hardhat/types";

import { deployContract } from "./deploy-contract";
import { addPage } from "./add-page";

const FIRST_PAGE_OBSCURED_BASE_URI =
  "ipfs://QmULBYeAZA3jgyfUdSFtruMNbKg8gMNMx2meVFbvizKsek";
const SECOND_PAGE_OBSCURED_BASE_URI =
  "ipfs://QmSPavZPFqjErgKgp2wYGJp5ToU2isgKo4bFsBJwGVQkWZ";

// NOTE: have to set as task coming after node startup otherwise will execute on a non-exposed ephemeral node
const runAfterNodeSetup = async (hre: HardhatRuntimeEnvironment) => {
  await setTimeout(0);

  const deploymentRecord = await deployContract(
    hre,
    "NFNovel",
    ["Test Novel", "NVN-1"],
    { report: true }
  );

  const nfnovel = await hre.ethers.getContractAt(
    "NFNovel",
    deploymentRecord.contractAddress
  );

  // set defaults BEFORE adding pages (which creates panel auctions)
  await nfnovel.setAuctionDefaults({
    duration: 30 * 60,
    startingValue: hre.ethers.constants.WeiPerEther.mul(0),
    minimumBidIncrement: hre.ethers.constants.WeiPerEther.mul(1),
  });

  await addPage(hre, 1, FIRST_PAGE_OBSCURED_BASE_URI, { report: true });
  await addPage(hre, 5, SECOND_PAGE_OBSCURED_BASE_URI, { report: true });
};

const startDevEnvTask = task(
  "dev",
  "set ups a local dev environment.\nstarts a hardhat node and deploys NFNovel to it (available in development env record)"
).setAction(async (_, hre: HardhatRuntimeEnvironment) => {
  runAfterNodeSetup(hre);

  return hre.run("node");
});

export default startDevEnvTask;

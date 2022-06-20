import { task, types } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  DeploymentEnvironment,
  getDeploymentRecord,
} from "./utils/record-deployment";

const FIRST_PAGE_REVEALED_BASE_URI =
  "ipfs://QmRbR29tusQaTsYRhvqtSiEz8NBvkasMhgeJboDtkZ7ouY";
const SECOND_PAGE_REVEALED_BASE_URI =
  "ipfs://QmQP4YGvt2Em4or54r9rm9NP5CG6cFE7YZj7kFQH1MnjsG";

export const revealPage = async (
  hre: HardhatRuntimeEnvironment,
  pageNumber: number,
  revealedBaseURI: string,
  options: {
    report?: boolean;
    environment?: DeploymentEnvironment;
  } = {}
) => {
  const { report = false, environment = "development" } = options;

  const deploymentRecord = getDeploymentRecord("NFNovel", environment);
  if (!deploymentRecord) {
    console.error(
      `NFNovel deployment record not found for environment [${environment}]`
    );
    process.exit(1);
  }

  const nfnovel = await hre.ethers.getContractAt(
    "NFNovel",
    deploymentRecord.contractAddress
  );

  try {
    const tx = await nfnovel.revealPage(pageNumber, revealedBaseURI);
    await tx.wait();

    if (report) {
      console.log(`Page [${pageNumber}] revealed`);
    }
  } catch (error: any) {
    console.error(`Failed to reveal Page [${pageNumber}] ${error.message}`);
  }
};

const revealPageTask = task(
  "revealPage",
  "reveals the panels of an NFNovel page"
)
  .addPositionalParam(
    "page",
    "page number of the page to reveal",
    undefined,
    types.int
  )
  .addPositionalParam(
    "baseURI",
    "the revealed base URI of the page",
    undefined,
    types.string
  )
  .addOptionalParam(
    "environment",
    "the environment the NFNovel deployment record belongs to",
    "development",
    types.string
  )
  .setAction(
    async (
      taskArgs: {
        page: number;
        baseURI: string;
        environment: DeploymentEnvironment;
      },
      hre: HardhatRuntimeEnvironment
    ) => {
      const { page, baseURI, environment } = taskArgs;

      await revealPage(hre, page, baseURI, {
        environment,
        report: true,
      });
    }
  );

export default revealPageTask;

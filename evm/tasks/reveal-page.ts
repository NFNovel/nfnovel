import { task, types } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  DeploymentEnvironment,
  getDeploymentRecord,
} from "./utils/record-deployment";

const FIRST_PAGE_REVEALED_BASE_URI =
  "ipfs://QmcLP748DuiaWhky7kmi4VPL7r6LGV5njyzZ6HdusvhfBR";
const SECOND_PAGE_REVEALED_BASE_URI =
  "ipfs://QmXa2JNSeLTznLFf3UpUXpoDygKAdMX2v92iFAdEDNJTp4";

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
    await nfnovel.revealPage(pageNumber, revealedBaseURI);
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

import { task, types } from "hardhat/config";
import type { HardhatRuntimeEnvironment } from "hardhat/types";
import {
  DeploymentEnvironment,
  getDeploymentRecord,
} from "./utils/record-deployment";

export const addPage = async (
  hre: HardhatRuntimeEnvironment,
  panelsCount: number,
  obscuredBaseURI: string,
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

  await nfnovel.addPage(panelsCount, obscuredBaseURI);

  if (report) {
    const currentPageNumber = await nfnovel.getCurrentPageNumber();

    const page = await nfnovel.getPage(currentPageNumber);
    console.log(
      `Page [${currentPageNumber.toString()}] added with panel token IDs [${page.panelTokenIds
        .map((tokenId) => tokenId.toString())
        .toString()}]`
    );
  }
};

const addPageTask = task("addPage", "adds a page to the NFNovel")
  .addPositionalParam(
    "panelsCount",
    "number of panels in the page",
    undefined,
    types.int
  )
  .addPositionalParam(
    "baseURI",
    "the obscured base URI of the page",
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
        panelsCount: number;
        baseURI: string;
        environment: DeploymentEnvironment;
      },
      hre: HardhatRuntimeEnvironment
    ) => {
      const { panelsCount, baseURI, environment } = taskArgs;

      await addPage(hre, panelsCount, baseURI, { environment, report: true });
    }
  );

export default addPageTask;

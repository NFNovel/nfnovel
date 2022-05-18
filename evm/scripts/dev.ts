import { deployContracts } from "./utils/deploy";
import { addPages } from "./utils/add-pages";

async function devSetup(): Promise<void> {
  /**
   * 1. deploy the contrac(s)
   * 2. add the pages
   */
  const deployments = await deployContracts();
  await addPages(deployments.NFNovel.contractAddress);
}

devSetup().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

export default devSetup;

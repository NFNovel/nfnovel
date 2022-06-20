import { task, types } from "hardhat/config";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import recordDeployment, {
  DeploymentEnvironment,
  doesDeploymentRecordExist,
} from "./utils/record-deployment";

export const deployContract = async (
  hre: HardhatRuntimeEnvironment,
  contractName: string,
  constructorArgs: string[],
  options: {
    report?: boolean;
    overwrite?: boolean;
    environment?: DeploymentEnvironment;
  } = {}
) => {
  const {
    report = false,
    overwrite = false,
    environment = "development",
  } = options;

  if (environment === "production") {
    const deploymentRecordExists = doesDeploymentRecordExist(
      contractName,
      environment
    );

    if (deploymentRecordExists && !overwrite) {
      console.error(
        `Existing production deployment record found for ${contractName}. Must pass --overwrite flag to replace it`
      );

      process.exit(1);
    }
  }

  const ContractFactory = await hre.ethers.getContractFactory(contractName);

  const contractInstance = await ContractFactory.deploy(...constructorArgs);

  await contractInstance.deployed();

  const deploymentRecord = await recordDeployment(
    contractName,
    contractInstance,
    environment
  );

  if (report) {
    console.log(
      `${contractName} deployed and recorded in env [${environment}]:`,
      deploymentRecord
    );
  }

  return deploymentRecord;
};

const deployContractTask = task(
  "deploy",
  "deploys a contract to the network specified by --network and records its features under the environment field of the deployment record. stores records in ./deployments/<ContractName>.json (relative to hardhat config location)"
)
  .addPositionalParam<string>(
    "contractName",
    "name of contract file (<ContractName>.sol, WITHOUT .sol extension)",
    undefined,
    types.string,
    false
  )
  .addVariadicPositionalParam(
    "constructorArgs",
    "args for the constructor in positional order",
    [],
    types.string,
    true
  )
  .addOptionalParam(
    "environment",
    "the environment the NFNovel deployment record belongs to",
    "development",
    types.string
  )
  .addFlag(
    "overwrite",
    "required to overwrite an existing production environment deployment record"
  )
  .setAction(
    async (
      taskArgs: {
        contractName: string;
        constructorArgs: string[];
        overwrite: boolean;
        environment: DeploymentEnvironment;
      },
      hre
    ) => {
      const { contractName, constructorArgs, environment, overwrite } =
        taskArgs;

      await deployContract(hre, contractName, constructorArgs, {
        overwrite,
        environment,
        report: true,
      });
    }
  );

export default deployContractTask;

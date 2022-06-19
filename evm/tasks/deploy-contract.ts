import { task, types } from "hardhat/config";
import recordDeployment, {
  DeploymentEnvironment,
  doesDeploymentRecordExist,
} from "../scripts/utils/record-deployment";

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
    "the environment the deployment belongs to",
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

      console.log(
        `${contractName} deployed and recorded in env [${environment}]:`,
        deploymentRecord
      );
    }
  );

export default deployContractTask;

/* eslint-disable @typescript-eslint/no-var-requires */
import path from "path";
import { writeFile, mkdir, stat } from "fs/promises";
import type { Contract } from "ethers";

export type DeploymentEnvironment = "test" | "development" | "production";

export interface IContractDeploymentRecord {
  deployedAt: string;
  ownerAddress: string;
  contractAddress: string;
  network: {
    name: string;
    chainId: number | string;
  };
}

export type ContractDeploymentRecords = {
  [key in DeploymentEnvironment]: IContractDeploymentRecord;
};

// NOTE: relative to hardhat config (project root)
const projectRootPath = process.cwd();
const deploymentsDirPath = path.resolve(projectRootPath, "deployments");

const buildDeploymentRecordsPath = (contractName: string) =>
  path.resolve(deploymentsDirPath, `${contractName}.json`);

export const getDeploymentRecord = (
  contractName: string,
  environment: DeploymentEnvironment
): IContractDeploymentRecord | null => {
  try {
    const deploymentRecords: ContractDeploymentRecords = require(buildDeploymentRecordsPath(
      contractName
    ));

    return deploymentRecords[environment];
  } catch (error) {
    return null;
  }
};

export const doesDeploymentRecordExist = (
  contractName: string,
  environment: DeploymentEnvironment
) => {
  const deploymentRecordPath = buildDeploymentRecordsPath(contractName);

  try {
    const deploymentRecords: ContractDeploymentRecords = require(deploymentRecordPath);

    return !!deploymentRecords[environment];
  } catch (_) {
    return false;
  }
};

const recordDeployment = async (
  contractName: string,
  deployedContract: Contract,
  environment: DeploymentEnvironment
): Promise<IContractDeploymentRecord> => {
  if (!deployedContract.address)
    throw new Error("Contract has not been deployed");

  const network = await deployedContract.provider.getNetwork();
  const ownerAddress = await deployedContract.signer.getAddress();

  const deploymentRecord: IContractDeploymentRecord = {
    network,
    ownerAddress,
    deployedAt: new Date().toISOString(),
    contractAddress: deployedContract.address,
  };

  await stat(deploymentsDirPath).catch(async () => {
    console.log("Creating deployments dir at:", deploymentsDirPath);
    await mkdir(deploymentsDirPath);
  });

  const deploymentRecordPath = buildDeploymentRecordsPath(contractName);

  await stat(deploymentRecordPath).catch(async () => {
    console.log(
      `Creating deployment record for [${contractName}] file at [${deploymentRecordPath}]`
    );

    await writeFile(deploymentRecordPath, JSON.stringify({}));
  });

  const deploymentRecords: ContractDeploymentRecords = require(deploymentRecordPath);

  deploymentRecords[environment] = deploymentRecord;

  await writeFile(
    deploymentRecordPath,
    JSON.stringify(deploymentRecords, null, 2)
  );

  console.log(
    `Saved deployment record for environment [${environment}] to [${deploymentRecordPath}]`
  );

  return deploymentRecord;
};

export default recordDeployment;

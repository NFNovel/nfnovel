import "dotenv/config";
import { ethers } from "hardhat";
import recordDeployment, {
  IContractDeploymentRecord,
} from "./record-deployment";

interface IContract {
  name: string;
  args: unknown[];
}

export const deployContract = async (
  contract: IContract
): Promise<IContractDeploymentRecord> => {
  const { name, args } = contract;

  const ContractFactory = await ethers.getContractFactory(name);
  const contractInstance = await ContractFactory.deploy(...args);

  await contractInstance.deployed();

  const deploymentRecord = await recordDeployment(name, contractInstance);
  console.log(`${name} deployed:`, deploymentRecord);

  return deploymentRecord;
};

export const deployContracts = async (): Promise<{
  [contractName: string]: IContractDeploymentRecord;
}> => {
  // set the contract name and deployment args in here
  // NOTE: must match the <name>.sol file, ex: for Greeter.sol contractName = "Greeter"
  const contracts: IContract[] = [
    {
      name: "NFNovels",
      args: [],
    },
    {
      name: "NFNovel",
      args: ["Test Novel", "NVN-1"],
    },
  ];

  const deployments: { [contractName: string]: IContractDeploymentRecord } = {};

  for (const contract of contracts) {
    const deploymentRecord = await deployContract(contract);
    deployments[contract.name] = deploymentRecord;
  }

  return deployments;
};

export default deployContracts;

import "dotenv/config";
import { ethers } from "hardhat";
import recordDeployment from "./record-deployment";

interface IContract {
  name: string;
  args: unknown[];
}

const deployContract = async (contract: IContract) => {
  const { name, args } = contract;

  const ContractFactory = await ethers.getContractFactory(name);
  const contractInstance = await ContractFactory.deploy(...args);
  console.log({ gas: contractInstance.estimateGas });
  await contractInstance.deployed();

  const deploymentRecord = await recordDeployment(name, contractInstance);
  console.log(`${name} deployed:`, deploymentRecord);
};

async function main() {
  // set the contract name(s) in here
  // NOTE: must match the <name>.sol file, ex: for Greeter.sol contractName = "Greeter"
  const contracts: IContract[] = [
    {
      name: "NFNovels",
      args: [],
    },
  ];

  await Promise.all(contracts.map(deployContract));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

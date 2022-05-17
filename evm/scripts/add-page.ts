import { ethers } from "hardhat";
import NFNovelContract from "../deployments/NFNovel.json";
async function addPages() {
  const contract = await ethers.getContractAt(
    "NFNovel",
    NFNovelContract.contractAddress
  );

  const pageOne = await contract.addPage(5, "test data for page 1");

  const pageTwo = await contract.addPage(6, "test data for page 2");
  console.log({ pageTwo, pageOne });
}

addPages();

export default addPages;

import { ethers } from "hardhat";

// add 2 pages
// 1: 1 panel (cover)
// 2: 6 panels ("first page")
export const addPages = async (
  nfnovelContractAddress: string
): Promise<void> => {
  // to interact wtih a contract we have to load the contract (as a JS object)
  // we need 2 pieces of information to do this using ethers
  // contract address (where it is deployed)
  // the contract ABI
  const contract = await ethers.getContractAt(
    "NFNovel",
    nfnovelContractAddress
  );

  console.log({ nfnovelContractAddress });

  const firstPageObscuredBaseURI =
    "ipfs://QmULBYeAZA3jgyfUdSFtruMNbKg8gMNMx2meVFbvizKsek";

  const secondPageObscuredBaseURI =
    "ipfs://QmSPavZPFqjErgKgp2wYGJp5ToU2isgKo4bFsBJwGVQkWZ";

  await contract.addPage(1, firstPageObscuredBaseURI);
  await contract.addPage(5, secondPageObscuredBaseURI);

  const pageOne = await contract.getPage(1);
  const pageTwo = await contract.getPage(2);

  console.log({ pageOne, pageTwo });
};

export default addPages;

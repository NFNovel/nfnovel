import nc from "next-connect";
import { BigNumber, providers, Wallet } from "ethers";
import NFNovelContract from "@contracts/NFNovel/NFNovel.sol/NFNovel.json";
import { NFNovel as NFNovelContractType } from "@contracts/types/NFNovel";
// NOTE: only available after running deploy script
// import NFNovelDeployment from "@contracts/deployments/NFNovel.json";

import getContract from "../../utils/get-contract";

import type { NextApiRequest, NextApiResponse } from "next";

const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY;
const OWNER_PRIVATE_KEY = process.env.OWNER_PRIVATE_KEY;

const handler = nc<NextApiRequest, NextApiResponse>({
  onError: (err, req, res) => {
    console.error(err);

    res.status(500).send({ error: err.message });
  },
}).post(async (req, res) => {
  const { to, tokenUri } = req.body;

  // const provider = new providers.AlchemyProvider(
  //   NFNovelDeployment.network.name,
  //   ALCHEMY_API_KEY,
  // );

  // const owner = new Wallet(OWNER_PRIVATE_KEY, provider);

  // const nfnovel = await getContract<NFNovelContractType>(
  //   NFNovelContract.abi,
  //   NFNovelDeployment.contractAddress,
  // );

  // const tx = await nfnovel.connect(owner).mint(to, tokenUri);
  // const receipt = await tx.wait();

  res.status(200).json({});
});

// TODO: implement a whitelist (otherwise anyone can mint...)
// const whitelist = ["0xa712Ab000829E67DeBD6Fe83179fF55a7a78EbC6"];

export default handler;

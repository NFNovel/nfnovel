import nc from "next-connect";
import { BigNumber, providers, Wallet } from "ethers";
import NFNovelContract from "@contracts/NFNovel/NFNovel.sol/NFNovel.json";
import { NFNovel as NFNovelContractType } from "@contracts/types/NFNovel";
// NOTE: only available after running deploy script
import NFNovelDeployment from "@contracts/deployments/NFNovel.json";

import getContract from "./utils";

import type { NextApiRequest, NextApiResponse } from "next";

interface PanelsPathRequest extends NextApiRequest {
  params: Record<string, any>;
}

const nfnovel = getContract<NFNovelContractType>(
  NFNovelContract.abi,
  NFNovelDeployment.contractAddress,
);

const handler = nc<PanelsPathRequest, NextApiResponse>({
  attachParams: true,
  onError: (err, req, res) => {
    console.error(err);

    res.status(500).send({ error: err.message });
  },
});

const basePath = "/api/panels";

// getRevealedPanelMetadata
handler.get(`${basePath}/revealed/:panelTokenId/metadata`, async (req, res) => {
  console.log({ metadata: req });
  res.json({ panelTokenId: req.params.panelTokenId });
});

// getOwnedPanelTokenIds
handler.get(`${basePath}/:ownerAddress/owned`, async (req, res) => {
  const { ownerAddress } = req.params;

  const filterTo = nfnovel.filters.Transfer(null, ownerAddress);

  const result = await nfnovel.queryFilter(filterTo, undefined, "latest");

  res.json({ logs: result });

  // filter = {
  //   address: ownerAddress
  //   topics: [
  //     "Transfer(address,address,uint256"
  //   ]
  // }

  // while(noMorePages){

  // }

  /**
   * approaches:
   *
   * "enumerate" (crudely) the pages
   * - for each page enumerate the panelTokenIds
   * - for each panelTokenId look up if ownerOf(panelTokenId) !== address(0)
   *
   *
   * query logs
   * - query for Transfer(from, to == ownerAddress, panelTokenId)
   *
   */

  // nfnovel.auctions.res.json({ ownerAddress: req.query.ownerAddress });
});

export default handler;

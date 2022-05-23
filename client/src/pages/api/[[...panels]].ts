import nc from "next-connect";
import NFNovelContract from "@contracts/NFNovel/NFNovel.sol/NFNovel.json";
import { NFNovel } from "@contracts/types/NFNovel";
// NOTE: only available after running deploy script
import NFNovelDeployment from "@contracts/deployments/NFNovel.json";

import { getContract } from "./utils";

import type { NextApiRequest, NextApiResponse } from "next";

interface PanelsPathRequest extends NextApiRequest {
  params: Record<string, any>;
}

const nfnovel = getContract<NFNovel>(
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

const getOwnedPanelTokenIds = async (
  nfnovel: NFNovel,
  ownerAddress: string,
) => {
  const filterTo = nfnovel.filters.Transfer(null, ownerAddress);

  const result = await nfnovel.queryFilter(filterTo, -10, "latest");

  return result.map((event) => event.args.tokenId.toNumber());
};

// getRevealedPanelMetadata
handler.get(`${basePath}/revealed/:panelTokenId/metadata`, async (req, res) => {
  console.log({ metadata: req });
  res.json({ panelTokenId: req.params.panelTokenId });
});

// getOwnedPanelTokenIds
handler.get(`${basePath}/:ownerAddress/owned`, async (req, res) => {
  const { ownerAddress } = req.params;

  res.json(await getOwnedPanelTokenIds(nfnovel, ownerAddress));
});

export default handler;

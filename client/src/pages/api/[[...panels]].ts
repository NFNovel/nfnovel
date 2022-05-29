import nc from "next-connect";
import NFNovelContract from "@evm/NFNovel/NFNovel.sol/NFNovel";
import { NFNovel } from "@evm/types/NFNovel";
// NOTE: only available after running deploy script
import NFNovelDeployment from "@evm/deployments/NFNovel";

import { getOwnedPanelTokenIds, loadRevealedPanelMetadata } from "./utils";
import getContract from "./utils/get-contract";

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

// loadRevealedPanelMetadata
handler.get(`${basePath}/revealed/:panelTokenId/metadata`, async (req, res) => {
  const { panelTokenId } = req.params;

  return res.json(await loadRevealedPanelMetadata(panelTokenId));
});

// getOwnedPanelTokenIds
handler.get(`${basePath}/:ownerAddress/owned`, async (req, res) => {
  const { ownerAddress } = req.params;

  return res.json(await getOwnedPanelTokenIds(nfnovel, ownerAddress));
});

export default handler;

// NOTE: may be needed for deployment
// export const config = {
//   unstable_includeFiles: ["src/panels"],
// };

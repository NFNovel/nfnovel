import nc from "next-connect";

import { loadRevealedPanelMetadata } from "./utils";

import type { NextApiRequest, NextApiResponse } from "next";

interface PanelsPathRequest extends NextApiRequest {
  params: Record<string, any>;
}

const handler = nc<PanelsPathRequest, NextApiResponse>({
  attachParams: true,
  onError: (err, req, res) => {
    console.error(err);

    res.status(500).send({ error: err.message });
  },
});

const basePath = "/api/panels";

// TODO: protect with owner auth
// loadRevealedPanelMetadata
handler.get(`${basePath}/revealed/:panelTokenId/metadata`, async (req, res) => {
  const { panelTokenId } = req.params;

  return res.json(await loadRevealedPanelMetadata(panelTokenId));
});

export default handler;

// NOTE: may be needed for deployment
// export const config = {
//   unstable_includeFiles: ["src/panels"],
// };

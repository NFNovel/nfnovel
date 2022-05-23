import axios from "axios";

import type { AxiosStatic } from "axios";
import type { BigNumber } from "ethers";
import type { PanelMetadata } from "src/types/token";
import type { NFNovel } from "@contracts/types/NFNovel";

export interface IPanelOwnerService {
  isPanelSold: (
    nfnovel: NFNovel,
    panelTokenId: BigNumber | number,
  ) => Promise<boolean>;
  getOwnedPanelTokenIds: (address: string) => Promise<(BigNumber | number)[]>;
  getRevealedPanelMetadata: (
    panelTokenId: BigNumber | number,
  ) => Promise<PanelMetadata>;
}

export const createPanelOwnerService = (
  fetcher: AxiosStatic,
  apiBaseUrl: string = process.env.API_BASE_URL || "",
): IPanelOwnerService => {
  const apiRequest = fetcher.create({
    baseURL: apiBaseUrl,
    headers: {
      Accept: "application/json",
    },
  });

  const PanelOwnerService: IPanelOwnerService = {
    isPanelSold: async (nfnovel, panelTokenId) => {
      try {
        await nfnovel.ownerOf(panelTokenId);

        return true;
      } catch {
        return false;
      }

      // return false; // NOT SOLD
      // const isSold = Math.random() < 0.5;
      // console.log({ panelTokenId, isSold });

      // return isSold; // IS SOLD
    },

    getOwnedPanelTokenIds: async (address) => {
      const { data } = await apiRequest.get(`/api/panels/${address}/owned`);

      // return []; // NOT OWNER
      // return [1, 2]; // OWNER
      return data;
    },

    // FUTURE: set up authorization
    getRevealedPanelMetadata: async (panelTokenId) => {
      // const { data } = await apiRequest.get(
      //   `/api/panels/revealed/${panelTokenId}/metadata`,
      // );

      return {
        name: "Batman-1-1",
        external_url: "https://nfnovel.com/Batman",
        description: "Batman Page 1, Panel 1",
        image: "ipfs://QmZg3jt5X9X9ZGuoZ9gbYJKGWbYXonYQBKyf9DGv8GNpF5",
        attributes: [
          {
            trait_type: "height",
            value: 1,
          },
          {
            trait_type: "width",
            value: 1,
          },
          {
            trait_type: "page",
            value: 1,
          },
          {
            trait_type: "panel",
            value: 1,
          },
        ],
      };

      // return data;
    },
  };

  return PanelOwnerService;
};

const PanelOwnerService = createPanelOwnerService(axios);

export default PanelOwnerService;

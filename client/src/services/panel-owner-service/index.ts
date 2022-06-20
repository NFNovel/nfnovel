import axios from "axios";

import type { NFNovel } from "@evm/types/NFNovel";

import type { BigNumber } from "ethers";
import type { AxiosStatic } from "axios";
import type { PanelMetadata } from "src/types/token";

export interface IPanelOwnerService {
  getOwnedPanelTokenIds: (
    nfnovelReader: NFNovel,
    ownerAddress: string,
  ) => Promise<(BigNumber | number)[]>;
  getRevealedPanelMetadata: (
    panelTokenId: BigNumber | number,
  ) => Promise<PanelMetadata | null>;
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
    getOwnedPanelTokenIds: async (
      nfnovelReader: NFNovel,
      ownerAddress: string,
    ) => {
      const filterTo = nfnovelReader.filters.Transfer(null, ownerAddress);

      const result = await nfnovelReader.queryFilter(filterTo, -10, "latest");

      return result.map((event) => event.args.tokenId.toNumber());
    },

    // FUTURE: set up authorization
    getRevealedPanelMetadata: async (panelTokenId) => {
      const { data } = await apiRequest.get(
        `/api/panels/revealed/${panelTokenId}/metadata`,
      );

      return data;
    },
  };

  return PanelOwnerService;
};

const PanelOwnerService = createPanelOwnerService(axios);

export default PanelOwnerService;

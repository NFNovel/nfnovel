import axios from "axios";

import type { NFNovel } from "@evm/types/NFNovel";

import type { BigNumberish } from "ethers";
import type { AxiosStatic } from "axios";
import type { PanelMetadata } from "src/types/token";

export interface IPanelOwnerService {
  getOwnedPanelTokenIds: (
    nfnovelReader: NFNovel,
    ownerAddress: string,
  ) => Promise<BigNumberish[]>;
  getRevealedPanelMetadata: (
    panelTokenId: BigNumberish,
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

      const transfersToOwnerResult = await nfnovelReader.queryFilter(filterTo);

      return transfersToOwnerResult.map((event) =>
        event.args.tokenId.toNumber(),
      );
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

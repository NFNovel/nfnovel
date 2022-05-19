import type { BigNumber } from "ethers";

export type Page = {
  /**
   * format: ipfs://\<CID\>
   * - @note no trailing slash at the end
   */
  baseURI: string;
  isRevealed: boolean;
  pageNumber: BigNumber;
  panelTokenIds: BigNumber[];
};

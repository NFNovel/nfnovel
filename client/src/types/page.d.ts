import type { BigNumber } from "ethers";
import type { ipfsURI } from "./token";

export type Page = {
  /**
   * format: ipfs://\<CID\>
   * - @note no trailing slash at the end
   */
  baseURI: ipfsURI;
  isRevealed: boolean;
  pageNumber: BigNumber;
  panelTokenIds: BigNumber[];
};

type heightOrWidth = number | `${number}` | `${number}%`;

type PanelColumn = { panelTokenId: number; columnWidth: heightOrWidth };

type PanelRow = {
  rowHeight: heightOrWidth;
  panelColumns: PanelColumn[];
};

type PageMetadata = {
  pageNumber: number;
  panelRows: PanelRow[];
};

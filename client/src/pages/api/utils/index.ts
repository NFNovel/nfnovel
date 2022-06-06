import path from "path";
import { readdir, readFile, stat } from "fs/promises";

import type { NFNovel } from "@evm/types/NFNovel";

export const getOwnedPanelTokenIds = async (
  nfnovel: NFNovel,
  ownerAddress: string,
) => {
  const filterTo = nfnovel.filters.Transfer(null, ownerAddress);

  const result = await nfnovel.queryFilter(filterTo, -10, "latest");

  return result.map((event) => event.args.tokenId.toNumber());
};

// NOTE: these names suck but it works...MVP shit

const buildRevealedDirPath = (panelsMetadataPath: string, pageNumber: string) =>
  path.join(panelsMetadataPath, pageNumber, "revealed");

// src/panels/{pageNumber}/revealed/{panelTokenId}
const buildPanelTokenPath = (
  panelsMetadataPath: string,
  pageNumber: string,
  panelTokenId: string,
) =>
  path.join(buildRevealedDirPath(panelsMetadataPath, pageNumber), panelTokenId);

const findPanelMetadataPath = async (
  panelsMetadataPath: string,
  pageNumberDirNames: string[],
  panelTokenId: string,
) => {
  for (const pageNumberDirName of pageNumberDirNames) {
    const pageRevealedDirpath = buildRevealedDirPath(
      panelsMetadataPath,
      pageNumberDirName,
    );

    for (const panelTokenIdFileName of await readdir(pageRevealedDirpath)) {
      // pagePanelEntries.push({ pageNumberDirName, panelTokenIdFileName });
      if (panelTokenIdFileName === panelTokenId)
        return buildPanelTokenPath(
          panelsMetadataPath,
          pageNumberDirName,
          panelTokenIdFileName,
        );
    }
  }

  return null;
};

export const loadRevealedPanelMetadata = async (panelTokenId: string) => {
  /**
   * get page dirs: list dirs in src/panels
   * for each page number dir get the revealed dir in src/panels/{pageNumber}/revealed
   * look through each revealed dir until finding matching panelTokenId
   */

  const panelsMetadataPath = path.join(process.cwd(), "src/panels");

  // src/panels/1/revealed/1
  const pageNumberDirNames = await readdir(panelsMetadataPath);

  const panelMetadataFilePath = await findPanelMetadataPath(
    panelsMetadataPath,
    pageNumberDirNames,
    panelTokenId,
  );

  return panelMetadataFilePath ?
    JSON.parse(await readFile(panelMetadataFilePath, "utf-8")) :
    null;
};

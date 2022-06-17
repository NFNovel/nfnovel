import React, { useMemo } from "react";
import { Box, Flex, VStack, Spacer } from "@chakra-ui/react";

import Panel from "../Panel";

import type { PanelProps } from "../Panel";
import type { heightOrWidth, PageMetadata } from "src/types/page";
import type { IpfsPanelData } from "src/hooks/use-nfnovel-ipfs-data";

type PageLayoutProps = {
  pagePanelsData: IpfsPanelData[];
  pageMetadata: PageMetadata;
};

type PanelRowProps = {
  rowHeight: heightOrWidth;
  panelColumns: PanelProps[];
};

const SPACING = "2px";

const PanelRow = (props: PanelRowProps) => {
  const { panelColumns, rowHeight } = props;

  return (
    <Flex
      minHeight={rowHeight}
      maxHeight={rowHeight}
    >
      {panelColumns.map((panelColumn) => {
        const {
          metadata,
          imageSource,
          columnWidth,
          panelTokenId,
        } = panelColumn;

        return (
          <Box key={`panel-${panelColumn.panelTokenId.toString()}`}>
            <Panel
              metadata={metadata}
              imageSource={imageSource}
              columnWidth={columnWidth}
              panelTokenId={panelTokenId}
            />
          </Box>
        );
      })}
    </Flex>
  );
};

const PageLayout = (props: PageLayoutProps) => {
  const { pageMetadata, pagePanelsData } = props;

  const panelRowsWithMetadata = useMemo(
    () =>
      // NOTE: merges page metadata with panel IPFS data for rendering
      pageMetadata.panelRows.map((panelRow, index) => {
        const panelColumnsWithMetadata = panelRow.panelColumns.map(
          (panelColumn) => {
            const IpfsPanelData = pagePanelsData.find(
              // compare as strings for matching
              (IpfsPanelData) =>
                IpfsPanelData.panelTokenId.toString() ===
                panelColumn.panelTokenId.toString(),
            );

            if (!IpfsPanelData) {
              throw new Error(
                `Panel data for panelTokenId [${panelColumn.panelTokenId}] not found`,
              );
            }

            return { ...panelColumn, ...IpfsPanelData };
          },
        );

        return {
          ...panelRow,
          panelColumns: panelColumnsWithMetadata,
          id: index,
        };
      }),
    [pageMetadata.panelRows, pagePanelsData],
  );

  return (
    <Box maxW={{ base: "container.sm", lg: "container.md" }}>
      <VStack
        my={"20px"}
        height="100%"
        width="100%"
        spacing={SPACING}
      >
        {panelRowsWithMetadata.map((panelRowWithMetadata) => (
          <PanelRow
            key={panelRowWithMetadata.id}
            rowHeight={panelRowWithMetadata.rowHeight}
            panelColumns={panelRowWithMetadata.panelColumns}
          />
        ))}
      </VStack>
    </Box>
  );
};

export default PageLayout;

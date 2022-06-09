import React from "react";
import { Box, Container, Flex, VStack, Spacer } from "@chakra-ui/react";

import { PanelData } from "src/contexts/panel-context";

import Panel from "../Panel";

import type { PanelProps } from "../Panel";
import type { heightOrWidth, PageMetadata } from "src/types/page";

type PageLayoutProps = {
  pagePanelsData: PanelData[];
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
          panelTokenId
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

  // NOTE: merges page metadata with panel data for rendering
  const panelRowsWithMetadata = pageMetadata.panelRows.map(
    (panelRow, index) => {
      const panelColumnWithMetadata = panelRow.panelColumns.map(
        (panelColumn) => {
          const panelData = pagePanelsData.find(
            // compare as strings for matching
            (panelData) =>
              panelData.panelTokenId.toString() ===
              panelColumn.panelTokenId.toString(),
          );

          if (!panelData)
            throw new Error(
              `Panel data for panelTokenId [${panelColumn.panelTokenId}] not found`,
            );

          return { ...panelColumn, ...panelData };
        },
      );

      return { ...panelRow, panelColumns: panelColumnWithMetadata, id: index };
    },
  );

  return (
    <Container>
      <VStack
        spacing={SPACING}
        height="100%"
        width="100%"
      >
        {panelRowsWithMetadata.map((panelRowWithMetadata) => (
          <PanelRow
            key={panelRowWithMetadata.id}
            rowHeight={panelRowWithMetadata.rowHeight}
            panelColumns={panelRowWithMetadata.panelColumns}
          />
        ))}
      </VStack>
      <Spacer height={"10px"} />
    </Container>
  );
};

export default PageLayout;

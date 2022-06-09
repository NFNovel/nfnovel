import { Spinner } from "@chakra-ui/react";
import { useContext, useEffect, useState } from "react";

import { PanelData, PanelContext } from "src/contexts/panel-context";
import useNFNovel from "src/hooks/use-nfnovel";
import { Page as PageType, PageMetadata } from "src/types/page";

import PageLayout from "./layout/Page";

// TODO: make available at <Page.baseURL>/metadata
const mockPageMetadata: { [pageNumber: number]: PageMetadata } = {
  1: {
    pageNumber: 1,
    panelRows: [
      {
        rowHeight: "100%",
        panelColumns: [{ panelTokenId: 1, columnWidth: "100%" }],
      },
    ],
  },
  2: {
    pageNumber: 2,
    panelRows: [
      {
        rowHeight: "40%",
        panelColumns: [
          { panelTokenId: 2, columnWidth: "40%" },
          { panelTokenId: 3, columnWidth: "60%" },
        ],
      },
      {
        rowHeight: "20%",
        panelColumns: [{ panelTokenId: 4, columnWidth: "100%" }],
      },
      {
        rowHeight: "20%",
        panelColumns: [{ panelTokenId: 5, columnWidth: "100%" }],
      },
      {
        rowHeight: "20%",
        panelColumns: [{ panelTokenId: 6, columnWidth: "100%" }],
      },
    ],
  },
};

function Page(props: { page: PageType }) {
  const { page } = props;

  const { nfnovel } = useNFNovel();
  const panelContext = useContext(PanelContext);

  const [pageMetadata, setPageMetadata] = useState<PageMetadata | null>(null);
  const [pagePanelsData, setpagePanelsData] = useState<PanelData[] | null>(
    null,
  );

  useEffect(() => {
    async function loadPanelsData() {
      if (!panelContext || !page) return;

      const panelsData = await panelContext.getPagePanelsData(page);
      setpagePanelsData(panelsData);
    }

    loadPanelsData();
  }, [page, panelContext?.getPagePanelsData]);

  useEffect(() => {
    // TODO: implement using IPFS functions
    const loadPageMetadata = async () => {
      if (!page) return;

      const metadata = mockPageMetadata[page.pageNumber.toNumber()];
      setPageMetadata(metadata);
    };

    loadPageMetadata();
  }, [page]);

  if (!nfnovel || !panelContext || !pagePanelsData?.length || !pageMetadata)
    return <Spinner />;

  return (
    <PageLayout
      pageMetadata={pageMetadata}
      pagePanelsData={pagePanelsData}
    />
  );
}

export default Page;

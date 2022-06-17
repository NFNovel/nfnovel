import { useEffect, useState } from "react";

import useNFNovelIpfsData from "src/hooks/use-nfnovel-ipfs-data";
import { Page as PageType, PageMetadata } from "src/types/page";

import PageLayout from "./layout/PageLayout";

import type { IpfsPanelData } from "src/hooks/use-nfnovel-ipfs-data";

function Page(props: { page: PageType }) {
  const { page } = props;

  const {
    ipfsStatus,
    getPageMetadata,
    getPagePanelsData,
  } = useNFNovelIpfsData();
  const [pageMetadata, setPageMetadata] = useState<PageMetadata | null>(null);
  const [pagePanelsData, setpagePanelsData] = useState<IpfsPanelData[] | null>(
    null,
  );

  useEffect(() => {
    const loadPanelsData = async () => {
      if (ipfsStatus !== "connected" || !page) return;

      const panelsData = await getPagePanelsData(page);
      setpagePanelsData(panelsData);
    };

    const loadPageMetadata = async () => {
      if (ipfsStatus !== "connected" || !page) return;

      const pageMetadata = await getPageMetadata(page);
      setPageMetadata(pageMetadata);
    };

    loadPageMetadata();
    loadPanelsData();
  }, [ipfsStatus, page, getPageMetadata, getPagePanelsData]);

  if (!pagePanelsData?.length || !pageMetadata) return null;

  return (
    <PageLayout
      pageMetadata={pageMetadata}
      pagePanelsData={pagePanelsData}
    />
  );
}

export default Page;

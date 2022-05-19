/* eslint-disable @next/next/no-img-element */
import { Spinner } from "@blueprintjs/core";
import { useContext, useEffect, useState } from "react";
import { NFNovelContext } from "src/contexts/nfnovel-context";
import { PanelData, PanelContext } from "src/contexts/panel-context";

import type { Page } from "src/types/page";

function Page(props: { pageData: Page }) {
  const pageData = props.pageData;

  const parsedPageData = {
    isRevealed: pageData.isRevealed,
    baseURI: pageData.baseURI,
    pageNumber: pageData.pageNumber.toNumber(),
    panelTokenIds: pageData.panelTokenIds,
  };

  /**
   * TODO:
   *
   * 1. use the PanelContext (see pages/Test.tsx for example)
   * 2. store the pagePanelsData as state
   * 3. use getPagePanelsData and then store the result in pagePanelsData state
   * (if no pagePanelsData show a <Spinner>)
   * 4. map over the pagePanelsData and render a <Panel data={panelData} /> for each one
   *
   * Panel is a new component (create in components/Panel.tsx then import here)
   * - props: { data: PanelData }
   * - it should render an <img src={data.imageSource} /> IF imageSource is not null
   *
   * discuss remaining steps
   */
  const { nfnovel } = useContext(NFNovelContext);
  const panelContext = useContext(PanelContext);

  const [pagePanelsData, setpagePanelsData] = useState<PanelData[] | null>(
    null,
  );

  // NOTE: this should be on all pages...site is useless without these two

  useEffect(() => {
    // define a function that will call getPagePanelsData
    async function loadPanelsData() {
      if (!panelContext) return;

      const { getPagePanelsData } = panelContext;

      const panelsData = await getPagePanelsData(pageData);
      setpagePanelsData(panelsData);
    }

    // call this function after defining it
    loadPanelsData();
  }, [pageData, panelContext]);

  if (!nfnovel || !panelContext || !pagePanelsData) return <Spinner />;
  // we want to load the pagePanelsData when the component mounts
  // we will do this calling getPagePanelsData

  return (
    <section className="mt-12 relative overflow-hidden py-12 px-4 border border-gray-900 sm:px-8">
      <div className="text-right mb-10 text-2xl">
        {parsedPageData.isRevealed == false ?
          "Active Auction" :
          "Auction Ended"}
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {pagePanelsData.map((panelData, key) => (
          // all of this can be the basis for the Panel component
          <article
            className="max-w-md mx-auto mt-4 bg-blue-800 shadow-lg border rounded-md duration-300 hover:shadow-sm"
            key={key}
          >
            <div className="filter opacity-100 hover:opacity-50 hover:red-500 duration-1000">
              {panelData.imageSource && (
                <img
                  src={panelData.imageSource}
                  className="w-full h-48 rounded-t-md"
                />
              )}
            </div>
          </article>
        ))}
      </div>
      <div className={"flex justify-center mt-10 text-3xl"}>
        Page: {parsedPageData.pageNumber}
      </div>
    </section>
  );
}

export default Page;

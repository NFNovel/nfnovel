import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import useNFNovel from "src/hooks/use-nfnovel";

import Page from "./Page";

import type { Page as PageType } from "src/types/page";

function PageList() {
  const { nfnovel } = useNFNovel();
  const [pages, setPages]: any = useState([]);

  const [hasMore, setHasMore] = useState(true);

  const fetchPageData = useCallback(
    async (pageNum: number) => {
      if (!nfnovel) return;

      nfnovel
        .getPage(pageNum)
        .then((pageData: any) => {
          setPages([...pages, pageData]);
        })
        .catch((e: any) => {
          console.log(e);
          console.log("setting hasMore(false)");
          setHasMore(false);
        });
    },
    [pages, nfnovel],
  );

  useEffect(() => {
    if (pages.length === 0) fetchPageData(1);
  }, [hasMore, pages, fetchPageData]);

  return (
    <>
      <div className="bg-slate-100 px-6 min-h-screen">
        <InfiniteScroll
          dataLength={pages.length}
          next={() => {
            fetchPageData(pages.length + 1);
          }}
          hasMore={hasMore}
          loader={
            <h4 className={"text-2xl ml-20 text-center mr-20 mt-10 mb-5"}>
              Loading...
            </h4>
          }
        >
          {pages.map((page: PageType, index: number) => (
            <Page
              key={index}
              page={page}
            />
          ))}
        </InfiniteScroll>
      </div>
    </>
  );
}

export default PageList;

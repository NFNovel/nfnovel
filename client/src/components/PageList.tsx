import { useCallback, useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import { Center, Spinner } from "@chakra-ui/react";

import useNFNovel from "src/hooks/use-nfnovel";

import Page from "./Page";

import type { Page as PageType } from "src/types/page";

function PageList() {
  const { getPage } = useNFNovel();
  const [pages, setPages]: any = useState([]);

  const [hasMore, setHasMore] = useState(true);

  const fetchPageData = useCallback(async () => {
    const page = await getPage(pages.length + 1);

    if (page) {
      setPages([...pages, page]);
    } else {
      setHasMore(false);
    }
  }, [getPage, pages]);

  useEffect(() => {
    if (!pages.length) fetchPageData();
  }, [pages, fetchPageData]);

  if (!pages.length) return null;

  return (
    <Center>
      <InfiniteScroll
        style={{
          overflow: "hidden",
          paddingBottom: "20px",
        }}
        dataLength={pages.length}
        next={fetchPageData}
        hasMore={hasMore}
        loader={
          <Center>
            <Spinner />
          </Center>
        }
      >
        {pages.map((page: PageType, index: number) => (
          <Page
            key={index}
            page={page}
          />
        ))}
      </InfiniteScroll>
    </Center>
  );
}

export default PageList;

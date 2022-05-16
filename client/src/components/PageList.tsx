import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import Page from "./Page";

function PageList() {
  const [pages, setPages] = useState({ items: Array.from({ length: 20 }) });

  const fetchMoreData = () => {
    setTimeout(() => {
      setPages({
        items: pages.items.concat(Array.from({ length: 1 })),
      });
    }, 1500);
  };

  return (
    <>
      <div className="bg-stone-900 px-6 min-h-screen">
        <InfiniteScroll
          dataLength={pages.items.length}
          next={fetchMoreData}
          hasMore={true}
          loader={<h4>Loading...</h4>}
        >
          {pages.items.map(
            (i, index) =>
              // <Page
              //   key={index}
              //   {...i}
              //   clickable={true}
              // />
              {i}
          )}
        </InfiniteScroll>
      </div>
    </>
  );
}

export default PageList;

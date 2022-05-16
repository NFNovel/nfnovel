import { useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";

import Page from "./Page";

function PageList() {
  const [pages, setPages] = useState([{ pageId: 1, panelIds: [1, 2] }]);

  const fetchMoreData = () => {
    setTimeout(() => {
      setPages([
        ...pages,
        {
          pageId: pages.length + 1,
          panelIds: [1, 2, 3, 4],
        },
      ]);
    }, 1500);
  };

  return (
    <>
      <div className="bg-slate-100 mt-10 px-6 min-h-screen">
        <InfiniteScroll
          dataLength={pages.length}
          next={fetchMoreData}
          hasMore={true}
          loader={<h4>Loading...</h4>}
        >
          {pages.map((pageData, index) => (
            <Page
              key={index}
              {...pageData}
              clickable={true}
            />
          ))}
        </InfiniteScroll>
      </div>
    </>
  );
}

export default PageList;

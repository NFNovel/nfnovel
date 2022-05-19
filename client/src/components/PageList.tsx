import { useEffect, useState } from "react";
import InfiniteScroll from "react-infinite-scroll-component";
import NFNovelDeployment from "@contracts/deployments/NFNovel.json";
import abi from "@contracts/NFNovel/NFNovel.sol/NFNovel.json";
import { ethers } from "ethers";

import getContract from "../utils/get-contract";

import Page from "./Page";

function PageList() {
  const [pages, setPages]: any = useState([]);

  const [hasMore, setHasMore] = useState(true);

  const NFNovelcontract: any = getContract(
    abi.abi,
    NFNovelDeployment.contractAddress,
  );

  const fetchPageData = (pageNum: number) => {
    NFNovelcontract.getPage(pageNum)
      .then((pageData: any) => {
        setPages([...pages, pageData]);
      })
      .catch((e: any) => {
        console.log(e);
        setHasMore(false);
      });
  };

  useEffect(() => {
    fetchPageData(1);
  }, []);

  return (
    <>
      <div className="bg-slate-100 px-6 min-h-screen">
        <InfiniteScroll
          dataLength={pages.length}
          next={() => fetchPageData(pages.length + 1)}
          hasMore={hasMore}
          loader={
            <h4 className={"text-2xl ml-20 text-center mr-20 mt-10 mb-5"}>
              Loading...
            </h4>
          }
        >
          {pages.map((pageData: any, index: number) => (
            <Page
              key={index}
              pageData={pageData}
              clickable={true}
            />
          ))}
        </InfiniteScroll>
      </div>
    </>
  );
}

export default PageList;

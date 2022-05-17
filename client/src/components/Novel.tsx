import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";

import Subheader from "./Subheader";
import Board from "./Board";
import PageList from "./PageList";

function Novel(props: any) {
  return (
    <>
      <Subheader
        title={props.title}
        author={props.author}
      />
      <PageList />
    </>
  );
}

export default Novel;

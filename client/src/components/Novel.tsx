import InfiniteScroll from "react-infinite-scroll-component";
import { useEffect, useState } from "react";

import Subheader from "./Subheader";
import Board from "./Board";

function Novel(props: any) {
  return (
    <>
      <Subheader
        title={props.title}
        author={props.author}
      />
      <Board />
    </>
  );
}

export default Novel;

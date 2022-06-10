import { useEffect, useState } from "react";
import { Box, Spinner } from "@chakra-ui/react";

import Novel from "src/components/Novel";
import useNFNovel from "src/hooks/use-nfnovel";

import type { NextPage } from "next";

type NovelDetails = {
  title: string;
  tokenSymbol: string;
};

/**
 * THINK: routing based on novel ID (from NFNovels factory)
 * event NovelCreated(uint256 indexed novelId, address indexed novelContract);
 * /<novelId> --> search for NovelCreated filter novelId --> contractAddress
 *
 * ref useNFNovel() --> useNFNovel(contractAddress) --> load instance for that address
 *
 * create NFNovels model to manage fetching/caching
 *
 * home page becomes selection of novels, upcoming votes/pledging, artists etc
 *
 */

const Home: NextPage = () => {
  const { getNovelDetails } = useNFNovel();

  const [novelDetails, setNovelDetails] = useState<NovelDetails | undefined>();

  useEffect(() => {
    const loadNovelDetails = async () => {
      const novelDetails = await getNovelDetails();
      setNovelDetails(novelDetails);
    };

    if (!novelDetails) loadNovelDetails();
  }, [novelDetails, getNovelDetails]);

  if (!novelDetails) return <Spinner />;

  const { title, tokenSymbol } = novelDetails;

  return (
    <Box padding={"20px"}>
      <Novel
        id={1}
        title={title}
      />
    </Box>
  );
};

export default Home;

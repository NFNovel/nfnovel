import { useContext } from "react";
import { Button } from "@blueprintjs/core";
import { connectToMetamask } from "src/utils/connect-metamask";
import { NFNovelContext } from "src/contexts/nfnovel-context";
import { PanelContext } from "src/contexts/panel-context";
import { Spinner } from "@blueprintjs/core";

import type { NextPage } from "next";

const Test: NextPage = () => {
  const {
    nfnovel,
    connectedAccount,
    metamaskProvider,
    connectContractToSigner,
  } = useContext(NFNovelContext);

  const panelContext = useContext(PanelContext);

  // NOTE: this should be on all pages...site is useless without these two
  if (!nfnovel || !panelContext) return <Spinner />;

  const { getPanelMetadata, getPanelImageSource } = panelContext;

  const connectAccount = async () => {
    if (!metamaskProvider) return;

    const connectedAccount = await connectToMetamask(metamaskProvider);

    if (!connectedAccount) {
      console.log("failed to connect to account");

      return;
    }

    connectContractToSigner(connectedAccount);
  };

  const loadPage = async () => {
    console.log({
      blockNumber: await nfnovel?.provider.getBlockNumber(),
      signerAddress: await nfnovel?.signer?.getAddress(),
      connectedAccount,
    });
    const page = await nfnovel?.getPage(1);
    console.log({ page });
  };

  const loadMetadata = async () => {
    console.log("loading panel metadata");
    const panelMetadata = await getPanelMetadata(1);
    console.log("after panel metadata load");
    console.log({ panelMetadata });
  };

  const loadImageSource = async () => {
    const panelImageSource = await getPanelImageSource(1);
    console.log({ panelImageSource });
  };

  return (
    <div>
      <h1>Test Page</h1>
      <Button onClick={connectAccount}>Connect</Button>
      <Button onClick={loadPage}>Load Page</Button>
      <Button onClick={loadMetadata}>Load Metadata</Button>
      <Button onClick={loadImageSource}>Load Image Source</Button>
    </div>
  );
};

export default Test;

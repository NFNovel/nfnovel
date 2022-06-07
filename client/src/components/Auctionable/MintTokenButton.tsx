import { Button } from "@blueprintjs/core";
import { useCallback, useState } from "react";
import { useContractEvent } from "wagmi";

import type { ERC721 } from "@evm/types/ERC721";

import useConnectedAccount from "src/hooks/use-connected-account";

import type { BigNumber } from "ethers";

type MintTokenButtonProps = {
  erc721Contract: ERC721;
  onMint: () => Promise<boolean>;
  onTransfer?: (tokenId: BigNumber) => void | Promise<void>;
  buttonLabel?: string;
};

const MintTokenButton = (props: MintTokenButtonProps) => {
  const {
    onMint,
    onTransfer,
    buttonLabel,
    erc721Contract
  } = props;

  const { connectedAccount, ConnectAccountButtons } = useConnectedAccount();

  const [mintError, setMintError] = useState("");
  const [mintedTokenId, setMintedTokenId] = useState<BigNumber>();
  const [transactionPending, setTransactionPending] = useState(false);

  const handleMintTransferEvent = useCallback(
    (args: any[]) => {
      const [from, to, tokenId] = args;

      if (to === connectedAccount?.address) {
        setMintedTokenId(tokenId);

        onTransfer && onTransfer(tokenId);
      }
    },
    [connectedAccount?.address, onTransfer],
  );

  useContractEvent(
    {
      addressOrName: erc721Contract.address,
      contractInterface: erc721Contract.interface,
    },
    "Transfer",
    handleMintTransferEvent,
  );

  const handleMint = async () => {
    try {
      setTransactionPending(true);
      await onMint();
    } catch (error: any) {
      console.error("error minting token", error);
      setMintError(error.message);
    } finally {
      setTransactionPending(false);
    }
  };

  if (!connectedAccount) return <ConnectAccountButtons />;

  if (mintedTokenId)
    return <div>Successfully minted token {mintedTokenId.toString()}!</div>;

  if (mintError) return <div>{mintError}</div>;

  return (
    <Button
      onClick={handleMint}
      loading={transactionPending}
      text={buttonLabel || "Mint Token"}
    />
  );
};

export default MintTokenButton;

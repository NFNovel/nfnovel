import { useCallback, useState } from "react";
import { useContractEvent } from "wagmi";

import type { ERC721 } from "@evm/types/ERC721";

import useConnectedAccount from "src/hooks/use-connected-account";
import useToastMessage from "src/hooks/use-toast-message";

import StyledButton from "../StyledButton";

import type { BigNumber } from "ethers";

type MintTokenButtonProps = {
  buttonLabel?: string;
  erc721Contract: ERC721;
  onMint: () => Promise<boolean>;
  onTransfer?: (tokenId: BigNumber) => void | Promise<void>;
};

const MintTokenButton = (props: MintTokenButtonProps) => {
  const {
    onMint,
    onTransfer,
    buttonLabel,
    erc721Contract,
  } = props;

  const {
    renderErrorToast,
    renderLoadingToast,
    renderSuccessToast,
  } = useToastMessage();

  const {
    hasSigner,
    connectedAccount,
    ConnectAccountButtons,
  } = useConnectedAccount();

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
      renderLoadingToast("Mint Transaction", "Waiting on confirmation...");
      await onMint();
      renderSuccessToast("Mint succesful!");
    } catch (error: any) {
      console.error("error minting token", error);
      renderErrorToast("Minting error", "Minting panel failed");
    } finally {
      setTransactionPending(false);
    }
  };

  if (!connectedAccount) return <ConnectAccountButtons />;

  return (
    <StyledButton
      onClick={handleMint}
      isLoading={transactionPending}
      buttonText={buttonLabel || "Mint Token"}
      disabled={!hasSigner || !!mintedTokenId}
    />
  );
};

export default MintTokenButton;

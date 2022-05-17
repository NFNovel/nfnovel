/* eslint-disable @next/next/no-img-element */
import { Button, Drawer, Position } from "@blueprintjs/core";
import { useState } from "react";

function AuctionModal(props: any) {
  const [visible, setVisibility] = useState(false);

  const visibleOn = () => {
    setVisibility(true);
  };

  const visibleOff = () => {
    setVisibility(false);
  };

  //   const state: IDrawerExampleState = {
  //     autoFocus: true,
  //     canEscapeKeyClose: true,
  //     canOutsideClickClose: true,
  //     enforceFocus: true,
  //     hasBackdrop: true,
  //     isOpen: false,
  //     position: Position.RIGHT,
  //     size: undefined,
  //     usePortal: true,
  // };
  return (
    <>
      <Drawer
        isOpen={visible}
        title="Place your Bid for this Panel"
        icon="info-sign"
        position={Position.BOTTOM}
        canEscapeKeyClose={true}
        canOutsideClickClose={false}
        enforceFocus={true}
        autoFocus={true}
        onClose={visibleOff}
        usePortal={true}
        hasBackdrop={true}
      >
        <div className="flex flex-row">
          <img
            src={
              "https://gateway.pinata.cloud/ipfs/QmdHcSkrPw8D7MoxuZ2VZ8H6KYDvhVphVxy7rZyNAo8EHZ"
            }
            className="border border-indigo-600 h-80"
          />
          <div className="bg-slate-500 flex flex-wrap flex-col">
            <div className="p-5">Highest bid: 1.2 ETH</div>
            <div className="p-5">
              Highest bidder: 0x1aVF3F8sa4f5sa8d6wd46D5sd6
            </div>
            <div className="p-5">Place bid: insert amount of ETH </div>
            <Button
              className="p-5 self-stretch"
              text="Place Bid"
              onClick={() => {
                alert("bid placed");
              }}
            ></Button>
          </div>

          <div className="bg-red-400 flex-wrap p-10">
            Time remaining! 05:15:36
          </div>
        </div>
      </Drawer>
      <Button
        className="bp4-minimal p-10"
        text="Open modal"
        onClick={visibleOn}
      ></Button>
    </>
  );
}

export default AuctionModal;
